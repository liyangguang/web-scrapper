import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import {scrapePage} from '$lib/server/puppeteer';

export const POST = (async ({request}) => {
  const requestBody = await request.json();
  const {url, format, withReadability} = requestBody;
  console.info('[API: /scrapper] Start...', url);

  try {
    const result = await scrapePage(url, format, withReadability);
    console.info('[API: /scrapper] Done!');
    return new Response(JSON.stringify({result}));
  } catch (e) {
    console.info('[API: /scrapper] Error');
    console.error(e);
    throw error(400, (e as Error)?.message);
  }
}) satisfies RequestHandler;
