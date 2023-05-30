<script lang="ts">
  import {page} from '$app/stores';

  // Not using server action here. We want to use and test the API.
  let url = 'https://en.wikipedia.org/wiki/Pro_Football_Hall_of_Fame';
  let format = 'markdown';
  let withReadability = true;
  let manualSelector = '';
  let result = '';
  const code = `const res = await fetch('${$page.url.href}api/scrapper', {
  method: 'POST',
  body: JSON.stringify({
    url: 'https://...', //'url to scrape',
    format: 'markdown',  // 'markdown', 'text', or 'html',
    withReadability: true, // optional, default true
    manualSelector: '',  // optional
  }),
});
const {result} = await res.json();
console.log(result);`;

  async function debug() {
    const res = await _fetchApi<{result: string}>('scrapper', {url, format, withReadability, manualSelector});
    result = res.result;
  }

  async function _fetchApi<ReponseBody, RequestBody = Object>(path: string, requestBody: RequestBody): Promise<ReponseBody> {
    const res = await fetch(`/api/${path}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
    if (!res.ok) {
      const textError = await res.text();
      let finalErrorMessage = '';
      try {
        const json = JSON.parse(textError)
        finalErrorMessage = json.message || textError;
      } catch {
        console.error(textError);
        finalErrorMessage = textError;
      }
      throw new Error(finalErrorMessage);
    }
    const responseBody = await res.json();
    return responseBody;
  }
</script>

<h1>Scrapper API</h1>
<h2>Usage</h2>
<pre><code>{code}</code></pre>
<h2>Debug</h2>
<label>
  URL: 
  <input type="text" bind:value={url}>
</label>
<label>
  Output format: 
  <select bind:value={format}>
    <option value="html">html</option>
    <option value="markdown">markdown</option>
    <option value="text">text</option>
  </select>
</label>
<div class="row">
  <label>
    <input type="checkbox" bind:checked={withReadability}>
    Only the main page content
  </label>
  <label>
    Only specific CSS selector(s)
    <input type="text" bind:value={manualSelector} placeholder="optional">
  </label>
</div>
<button on:click={debug}>run</button>
<div class="result">
  {result}
</div>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  h1 {
    margin-bottom: .5em;
  }

  h2 {
    margin-bottom: .5em;
    margin-top: 1em;
  }

  label {
    display: flex;
    align-items: center;
    gap: 1em;
    margin-bottom: .5em;
  }

  select,
  input[type=text] {
    flex: 1;
    padding: .5em;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1em;
  }

  button {
    padding: .5em;
  }

  code {
    padding: 1em;
  }

  .result {
    padding: 1em;
    white-space: pre-wrap;
    border: 1px solid #000;
    margin-top: 1em;
  }
</style>
