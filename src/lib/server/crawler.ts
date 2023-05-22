import type {Page} from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';

const IS_DEBUGGING = false;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

const CHROMIUM_DOWNLOAD_URL = 'https://github.com/Sparticuz/chromium/releases/download/v110.0.1/chromium-v110.0.1-pack.tar';

async function getBrowserInstance() {
  const puppeteer = IS_DEVELOPMENT ? await import('puppeteer') : await import('puppeteer-core');
  return await puppeteer.launch({
    executablePath: IS_DEVELOPMENT ? undefined : await chromium.executablePath(CHROMIUM_DOWNLOAD_URL),
    args: chromium.args,
    defaultViewport: {
      width: 1280,
      height: 600,
    },
    ...(IS_DEVELOPMENT && IS_DEBUGGING ? {headless: false, slowMo: 50} : {}),
  })
}

export async function getFromWebpage(url: string, preProcess?: (page: Page) => Promise<void>, manualSelector: string[] = []): Promise<string> {
  console.info('[Puppeteer] Starting...')
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    await page.goto(url, {timeout: 15000});
  } catch {
    // Some websites (e.g. traditional big news) keeps loading for a very long time (ads, etc.), while the main content on the page is ready.
    // Instead of treating it as "failed to navigate to the page", ignore the timeout and read the current dom.
    console.warn('[Puppeteer] Page loading timed out. Using whatever is currently on the page.')
  }

  console.info('[Puppeteer] Running pre-processing...');
  preProcess && await preProcess(page);

  console.info('[Puppeteer] Getting text...');
  let result = '';
  if (manualSelector.length) {
    console.info('[Puppeteer] Using manual selectors...');
    const text = await Promise.all(manualSelector.map(async (selector) => {
      const elementsMatchingThisSelector = await page.$$(selector);
      return Promise.all(elementsMatchingThisSelector.map((element) => page.evaluate(el => el.innerText, element)))
    }));
    result = text.flat().filter((content): content is string => !!content).join('\n');
  } else {
    const bodyHTML = await page.$eval('body', (element) => element.innerHTML);
    result = cleanUpHTML(bodyHTML, url);
  }
  await browser.close();
  console.info('[Puppeteer] Done.')
  return result;
}

async function waitAndClick(page: Page, containerSelector: string, targetSelector = ''): Promise<void> {
  await page.waitForSelector(containerSelector);
  // `page.click()` seems unreliable in some cases. When the page jumps due to loading (ads) during the command, the cursor will click on the previous position of the element.
  // While using JS to directly click the element is fine (not using the position).
  // await page.click(`${containerSelector} ${targetSelector}`);
  await page.$eval(`${containerSelector} ${targetSelector}`, (elem) => (elem as HTMLElement).click());
}

function cleanUpHTML(bodyString: string, url: string): string {
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
