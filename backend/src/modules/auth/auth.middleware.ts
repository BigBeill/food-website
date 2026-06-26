// src/modules/auth/auth.middleware.ts
import { Elysia } from 'elysia';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../common/errors/app-error';
import type { JwtPayload } from './auth.types';

export const authenticateMiddleware = new Elysia({ name: 'authenticate' }).derive(
   { as: 'scoped' },
   ({ headers }): { authId?: string} => {
      const header = headers.authorization;
      if (!header?.startsWith('Bearer')) {
         return { authId: undefined }
      }

      const token = header.slice('Bearer '.length);
      try {
         const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
         return { authId: payload.authId };
      } catch {
         return { authId: undefined }
      }

   }
)

export const authorizeMiddleware = new Elysia({ name: 'authorize' })
.use(authenticateMiddleware)
.derive(
   { as: 'scoped' },
   ({ authId }): { authId: string } => {
      if (!authId) { throw new UnauthorizedError('Invalid or expired token'); }
      return { authId }
   },
);