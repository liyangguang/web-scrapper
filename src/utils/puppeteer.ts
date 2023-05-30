import puppeteer, {type Page} from 'puppeteer';
import { getReadabilityHtml, getContentString, getContentMarkdown } from './html';

const IS_DEBUGGING = false;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export async function scrapePage(url: string, format: 'html'|'text'|'markdown', withReadability = true, manualSelector?: string, preProcess?: (page: Page) => Promise<void>): Promise<string> {
  const html = await scrapeHtml(url, manualSelector, preProcess);
  const readyHtml = withReadability ? getReadabilityHtml(html) : html;
  switch (format) {
    case 'html':
      return readyHtml;
    case 'markdown':
      return getContentMarkdown(readyHtml);
    case 'text':
      return getContentString(readyHtml);
    default:
      throw new Error(`Failed to scrape. Unknown format: ${format}`);
  }
}

async function getBrowserInstance() {
  return await puppeteer.launch({
    defaultViewport: {
      width: 1280,
      height: 600,
    },
    args: ['--no-sandbox'],
    headless: 'new',
    ...(IS_DEVELOPMENT && IS_DEBUGGING ? {headless: false, slowMo: 50} : {}),
  });
}

async function scrapeHtml(url: string, manualSelector?: string, preProcess?: (page: Page) => Promise<void>): Promise<string> {
  console.info('[Puppeteer] Starting...');
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    console.info('[Puppeteer] Navigating...');
    await page.goto(url, {timeout: 15000});
  } catch {
    // Some websites (e.g. traditional big news) keeps loading for a very long time (ads, etc.), while the main content on the page is ready.
    // Instead of treating it as "failed to navigate to the page", ignore the timeout and read the current dom.
    console.warn('[Puppeteer] Page loading timed out. Using whatever is currently on the page.')
  }

  console.info('[Puppeteer] Running pre-processing...');
  preProcess?.(page);

  console.info('[Puppeteer] Getting text...');
  let result = '';
  if (manualSelector) {
    console.info('[Puppeteer] Using manual selectors...');
    const elements = await page.$$(manualSelector);
    const htmlPieces = await Promise.all(elements.map((element) => page.evaluate(el => el.outerHTML, element)));
    result = `<body>${htmlPieces.join('\n')}</body>`;
  } else {
    result = await page.$eval('body', (element) => element.outerHTML);
  }
  await browser.close();
  console.info('[Puppeteer] Done.')
  return result;
}

// async function waitAndClick(page: Page, containerSelector: string, targetSelector = ''): Promise<void> {
//   await page.waitForSelector(containerSelector);
//   // `page.click()` seems unreliable in some cases. When the page jumps due to loading (ads) during the command, the cursor will click on the previous position of the element.
//   // While using JS to directly click the element is fine (not using the position).
//   // await page.click(`${containerSelector} ${targetSelector}`);
//   await page.$eval(`${containerSelector} ${targetSelector}`, (elem) => (elem as HTMLElement).click());
// }
