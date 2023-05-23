import type { RequestHandler } from '../$types';

export const POST = (async () => {
  console.info('[API: /test] Start...');
  return new Response(JSON.stringify({done: true}));
}) satisfies RequestHandler;
