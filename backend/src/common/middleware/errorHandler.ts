import { Elysia } from 'elysia';
import { AppError } from '../errors/app-error';

export const errorHandler = new Elysia({ name: 'error-handler' })
   .onError(({ error, code, set }) => {
      if (error instanceof AppError) {
         set.status = error.statusCode;
         return { error: { code: error.code, message: error.message } };
      }

      if (code === 'VALIDATION') {
         set.status = 400;
         return { error: { code: 'VALIDATION_ERROR', message: error.message } };
      }

      console.error('Unhandled error:', error);
      set.status = 500;
      return { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } };
   })
      .as('global');