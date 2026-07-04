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

export const authApi = {
   login: (params: LoginParams): Promise<void> =>
      sendServerRequest({
         url: "/auth/login",
         method: "POST",
         body: params,
      }),

   logout: (): Promise<void> => 
      sendServerRequest({
         url: '/auth/logout',
         method: 'POST',
      }),

   register: (params: RegisterParams): Promise<void> =>
      sendServerRequest({
         url: "/auth/register",
         method: "POST",
         body: params,
      }),

   requestPasswordReset: (params: RequestPasswordResetParams): Promise<void> =>
      sendServerRequest({
         url: "/auth/requestPasswordReset",
         method: "POST",
         body: params,
      }),

   resetPassword: (params: ResetPasswordParams): Promise<void> =>
      sendServerRequest({
         url: "/auth/resetPassword",
         method: "POST",
         body: params,
      }),
};