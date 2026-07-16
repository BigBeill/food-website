// src/modules/auth/auth.middleware.ts
import { Elysia } from 'elysia';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../common/errors/app-error';
import type { JwtPayloadType } from './auth.types';

export const authenticateMiddleware = new Elysia({ name: 'authenticate' }).derive(
   { as: 'scoped' },
   ({ cookie: { accessToken } }): { authId?: string } => {
      const token = accessToken?.value as string;
      if (!token) { return { authId: undefined } }
      
      try {
         const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayloadType;
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