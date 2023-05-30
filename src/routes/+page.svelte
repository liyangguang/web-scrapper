<script lang="ts">
  // Not using server action here. We want to use and test the API.
  let url = 'https://en.wikipedia.org/wiki/Pro_Football_Hall_of_Fame';
  let format = 'markdown';
  let result = '';

  async function debug() {
    const res = await _fetchApi<{result: string}>('scrapper', {url, format})
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
<label>
  URL: 
  <input type="text" bind:value={url}>
</label>
<label>
  Output format: 
  <input type="text" bind:value={format} placeholder="html, text, or markdown">
</label>
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

  label {
    display: flex;
    align-items: center;
    gap: 1em;
    margin-bottom: .5em;
  }

  input {
    flex: 1;
    padding: .5em;
  }

  button {
    padding: .5em;
  }

  .result {
    padding: 1em;
    white-space: pre-wrap;
    border: 1px solid #000;
    margin-top: 1em;
  }
</style>
