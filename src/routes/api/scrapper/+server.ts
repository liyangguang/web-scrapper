import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import {getFromWebpage} from '$lib/server/puppeteer';
import {run} from '$lib/server/crawlee';

export const POST = (async ({request}) => {
  const requestBody = await request.json();
  const {url} = requestBody;
  console.info('[API: /scrapper] Start...', url);

  try {
    const result = await run();

    console.info('[API: /scrapper] Done!');
    return new Response(JSON.stringify({result}));
  } catch (e) {
    console.info('[API: /scrapper] Error');
    console.error(e);
    throw error(400, (e as Error)?.message);
  }
}) satisfies RequestHandler;
