import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';

export function getContentString(bodyString: string, url: string): string {
  const doc = new JSDOM(bodyString, {url});
  const reader = new Readability(doc.window.document);
  const readabilityResult = reader.parse()!;
  const cleanedDOM = new JSDOM(readabilityResult.content, {url});
  // Remove information that is not useful in text context.
  for (const aEl of [...cleanedDOM.window.document.querySelectorAll('a')]) {
    aEl.href = '';
  }
  for (const aEl of [...cleanedDOM.window.document.querySelectorAll('img, video, object')]) {
    aEl.remove();
  }
  return convert(cleanedDOM.window.document.querySelector('body')!.innerHTML, {selectors: [{selector: 'table', format: 'dataTable'}]})
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
