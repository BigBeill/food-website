import { Elysia, t } from 'elysia';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { RegisterValidator } from './validators/register.validator';
import { LoginValidator } from './validators/login.validator';
import { authorizeMiddleware } from './auth.middleware';
import { requestPasswordResetValidator } from './validators/requestPasswordReset.validator';
import { NotFoundError } from '../../common/errors/app-error';

const service = new AuthService(new AuthRepository());

export const authController = new Elysia({ prefix: '/auth' })
   .post( '/login',
      async ({ body, set, cookie: { accessToken, refreshToken } }) => {
         const { name, password, rememberMe } = body;
         const result = await service.login(name, password, rememberMe);
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: result.tokens.refreshToken,
            ...(rememberMe && { maxAge: 60 * 60 * 24 * 30 }) // 30 days in seconds if rememberMe is true
         });
         set.status = 200;
         return { 
            message: "User logged in",
            data: result.user
         };
      },
      {
         body: LoginValidator,
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.Optional(t.String()),
         })
      }
   )
   .post( '/refresh',
      async ({ set, cookie: { accessToken, refreshToken } }) => {
         const result = await service.refreshTokens(refreshToken.value);
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         set.status = 200;
         return { 
            message: "refresh successful"
         };
      },
      {
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.String(),
         })
      }
   )
   .post( '/register',
      async ({ body, set, cookie: { accessToken, refreshToken } }) => {
         const { name, email, password } = body;
         const result = await service.register(name, email, password);
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: result.tokens.refreshToken,
         });
         set.status = 201;
         return {
            message: "Account registered",
            data: result.user,
         };
      },
      {
         body: RegisterValidator,
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.Optional(t.String()),
         })
      }
   )
   .post('/requestPasswordReset',
      async ({ set, body }) => {
         const { email } = body;
         try { await service.requestPasswordReset(email); }
         // catch not found errors and return as if it was a success (prevents an enumeration attack)
         catch (error) { if (!(error instanceof NotFoundError)) { throw error; } }
         set.status = 201;
         return {
            message: "Password reset link sent if account exists"
         }
      },
      {
         body: requestPasswordResetValidator,
      }
   )

   //* Routes past this point require a valid accessToken to use
   .use(authorizeMiddleware)
   .post( '/logout',
      async ({ set, cookie: { accessToken, refreshToken } }) => {
         await service.removeRefreshToken(refreshToken.value);
         accessToken.remove();
         refreshToken.remove();
         set.status = 201;
         return { 
            message: "logout successful"
         };
      },
      {
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.String(),
         })
      }
   )