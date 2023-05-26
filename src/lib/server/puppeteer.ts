import puppeteer, {type Page, Browser} from 'puppeteer';
import { getContentString } from './html';

const IS_DEBUGGING = false;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

let browser: Browser|undefined;

async function getBrowserInstance() {
  if (browser) return browser;

  browser = await puppeteer.launch({
    defaultViewport: {
      width: 1280,
      height: 600,
    },
    headless: 'new',
    ...(IS_DEVELOPMENT && IS_DEBUGGING ? {headless: false, slowMo: 50} : {}),
  });
  return browser;
}

export async function getFromWebpage(url: string, manualSelector?: string, preProcess?: (page: Page) => Promise<void>): Promise<string> {
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
    const text = await Promise.all(elements.map((element) => page.evaluate(el => el.innerText, element)))
    result = text.filter((content): content is string => !!content).join('\n');
  } else {
    const bodyHTML = await page.$eval('body', (element) => element.innerHTML);
    result = getContentString(bodyHTML, url);
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
