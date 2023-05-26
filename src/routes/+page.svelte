<script lang="ts">
  async function debug() {
    const res = await _fetchApi('scrapper', {url: 'https://en.wikipedia.org/wiki/Pro_Football_Hall_of_Fame'})
    console.log(res);
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
<button on:click={debug}>debug run</button>