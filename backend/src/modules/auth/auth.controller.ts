import { Elysia, t } from 'elysia';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { RegisterValidator } from './validators/register.validator';
import { LoginValidator } from './validators/login.validator';
import { authorizeMiddleware } from './auth.middleware';
import { requestPasswordResetValidator } from './validators/requestPasswordReset.validator';

const service = new AuthService(new AuthRepository());

export const authController = new Elysia({ prefix: '/auth' })
   .post(
      '/login',
      async ({ body, set, cookie: { accessToken, refreshToken } }) => {
         const { name, password, rememberMe } = body;
         const result = await service.login(name, password, rememberMe);
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: result.tokens.refreshToken,
            maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
         });
         set.status = 200;
         return { data: result.user };
      },
      {
         body: LoginValidator,
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.Optional(t.String()),
         })
      }
   )
   .post(
      '/refresh',
      async ({ set, cookie: { accessToken, refreshToken } }) => {
         const result = await service.refreshTokens(refreshToken.value);
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         set.status = 200;
         return { data: true };
      },
      {
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.String(),
         })
      }
   )
   .post('/requestPasswordReset',
      async ({ body }) => {
         const { email } = body;
         service.requestPasswordReset(email);
      },
      {
         body: requestPasswordResetValidator,
      }
   )
   .post(
      '/register',
      async ({ body, set, cookie: { accessToken, refreshToken } }) => {
         const { name, email, password } = body;
         const result = await service.register(name, email, password);
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: result.tokens.refreshToken,
            maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
         });
         set.status = 201;
         return { data: result.user };
      },
      {
         body: RegisterValidator,
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.Optional(t.String()),
         })
      }
   )

   //* Routes past this point require a valid accessToken to use
   .use(authorizeMiddleware)
   .post(
      '/logout',
      async ({ set, cookie: { accessToken, refreshToken } }) => {
         await service.removeRefreshToken(refreshToken.value);
         accessToken.remove();
         refreshToken.remove();
         set.status = 201;
         return { data: true };
      },
      {
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.String(),
         })
      }
   )