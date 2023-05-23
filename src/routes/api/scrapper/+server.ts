import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import {getFromWebpage} from '$lib/server/crawler';

export const POST = (async ({request}) => {
  console.info('[API: /scrapper] Start...');
  const requestBody = await request.json();
  const {url} = requestBody;

  let result = '';
  try {
    result = await getFromWebpage(url);

    console.info('[API: /scrapper] Done!');
    return new Response(JSON.stringify({result}));
  } catch (e) {
    console.info('[API: /scrapper] Error');
    console.error(e);
    throw error(400, (e as Error)?.message);
  }
}) satisfies RequestHandler;
