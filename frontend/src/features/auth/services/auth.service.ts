// features/auth/services/authService.ts
import sendServerRequest from "@/shared/lib/api";

interface LoginParams {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface RequestPasswordResetParams {
   email: string;
}

interface ResetPasswordParams {
  token: string;
  password: string;
}

export const authService = {
   login: (params: LoginParams) =>
      sendServerRequest({
         url: "/auth/login",
         method: "POST",
         body: params,
      }),

   logout: () => 
      sendServerRequest({
         url: '/auth/logout',
         method: 'POST',
      }),

   register: (params: RegisterParams) =>
      sendServerRequest({
         url: "/auth/register",
         method: "POST",
         body: params,
      }),

   requestPasswordReset: (params: RequestPasswordResetParams) =>
      sendServerRequest({
         url: "/auth/requestPasswordReset",
         method: "POST",
         body: params,
      }),

   resetPassword: (params: ResetPasswordParams) =>
      sendServerRequest({
         url: "/auth/resetPassword",
         method: "POST",
         body: params,
      }),
};