import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

export function getReadabilityHtml(bodyString: string, url?: string): string {
  const doc = new JSDOM(bodyString, {url});
  const reader = new Readability(doc.window.document);
  const readabilityResult = reader.parse()!;
  return readabilityResult.content;
}

export function getContentString(bodyString: string, url?: string): string {
  const dom = new JSDOM(bodyString, {url});
  removeNonVisual(dom.window.document);
  return convert(dom.window.document.querySelector('body')!.innerHTML, {
    selectors: [{selector: 'table', format: 'dataTable'}],
  });
}

export function getContentMarkdown(bodyString: string, url?: string): string {
  const dom = new JSDOM(bodyString, {url});
  removeNonVisual(dom.window.document);
  return turndownService.turndown(dom.window.document.querySelector('body')!.innerHTML);
}

function removeNonVisual(document: Document) {
  for (const aEl of [...document.querySelectorAll('a')]) {
    aEl.href = '';
  }
  for (const aEl of [...document.querySelectorAll('img, video, object')]) {
    aEl.remove();
  }
}
