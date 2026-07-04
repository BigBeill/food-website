import { authApi } from "./auth.api";
import { checkValidPassword } from "./auth.utils";


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
  passwordOne: string;
  passwordTwo: string;
  token: string;
}

export const authService = {
   login: (params: LoginParams): Promise<void> => {
      return authApi.login(params);
   },
   logout: (): Promise<void> => {
      return authApi.logout();
   },
   register: (params: RegisterParams) => {
      return authApi.register(params);
   },
   requestPasswordReset: (params: RequestPasswordResetParams) => {
      return authApi.requestPasswordReset(params);
   },
   resetPassword: (params: ResetPasswordParams) => {
      const { passwordOne, passwordTwo, token } = params;
      checkValidPassword(passwordOne); // errors will handle any issue
      if (passwordOne !== passwordTwo) { throw new Error("Passwords do not match!"); }
      return authApi.resetPassword({password: passwordOne, token});
   }
}