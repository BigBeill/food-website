import { Elysia } from 'elysia';
import { corsConfig } from './config/cors';
import { errorHandler } from './common/middleware/errorHandler';
import { logger } from './common/middleware/logger';
import { authController } from './modules/auth/auth.controller';
import { usersController } from './modules/users/users.controller';
import { removeMongooseNoise } from './common/utils/db.mapper';
import { ingredientsController } from './modules/ingredients/ingredients.controller';
import { imagesController } from './modules/images/images.controller';
import { recipesController } from './modules/recipes/recipes.controller';

export const app = new Elysia()
   .use(errorHandler)
   .mapResponse({ as: 'global' }, ({ responseValue }) => {
      if (responseValue && typeof responseValue === 'object' && 'data' in responseValue) {
         return new Response(
            JSON.stringify({ data: removeMongooseNoise((responseValue as any).data) }),
            { headers: { 'Content-Type': 'application/json' } }
         );
      }
   })
   .use(corsConfig)
   .use(logger)
   .get('/health', () => ({ status: 'ok' }))
   .group('/api/v1', (api) =>
      api
         .use(authController)
         .use(imagesController)
         .use(ingredientsController)
         .use(recipesController)
         .use(usersController),
   );

export type App = typeof app;