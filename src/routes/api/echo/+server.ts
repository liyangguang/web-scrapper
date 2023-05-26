import type { RequestHandler } from '../$types';

export const POST = (async () => {
  console.info('[API: /echo] Start...');
  return new Response(JSON.stringify({echo: true}));
}) satisfies RequestHandler;
