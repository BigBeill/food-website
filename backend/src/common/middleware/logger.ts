import { Elysia } from 'elysia';

export const logger = new Elysia({ name: 'logger' })
   .onRequest(({ request }) => {
      const path = new URL(request.url).pathname;
      console.log(`→ ${request.method} ${path}`);
   })
   .onAfterHandle(({ request, set }) => {
      const path = new URL(request.url).pathname;
      console.log(`← ${request.method} ${path} ${set.status ?? 200}`);
   });