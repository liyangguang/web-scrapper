import ogs from 'open-graph-scraper';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';

export async function fetchOpenGraph(url:string): Promise<string> {
  console.info('[OpenGraph]', url);
  try {
    const res = await ogs({url});
    const htmlString = (res.response as {body: string})?.body || '';
    const readableDocument = getReadableDocument(htmlString, url);
    const textOnlyHtml = praseTextOnly(copyDocument(readableDocument, url));
  
    return textOnlyHtml;
  } catch (e) {
    console.warn('[OpenGraph] Failed to load page', url);
    return '';
  }
}

function getReadableDocument(htmlString: string, url: string): Document {
  const doc = new JSDOM(htmlString, {url});
  const reader = new Readability(doc.window.document);
  const readabilityResult = reader.parse()!;
  const cleanedDOM = new JSDOM(readabilityResult.content, {url});
  return cleanedDOM.window.document;
}

function copyDocument(origin: Document, url: string): Document {
  return new JSDOM(origin.body.innerHTML, {url}).window.document;
}

function praseTextOnly(readableDocument: Document): string {
  // Remove information that is not useful in text context.
  for (const aEl of [...readableDocument.querySelectorAll('a')]) {
    aEl.href = '';
  }
  for (const aEl of [...readableDocument.querySelectorAll('img, video, object')]) {
    aEl.remove();
  }
  return convert(readableDocument.querySelector('body')!.innerHTML, {selectors: [{selector: 'table', format: 'dataTable'}]})
}
