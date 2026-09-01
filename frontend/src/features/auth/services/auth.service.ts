import { authApi } from "./auth.api";
import { checkValidEmail, checkValidPassword } from "./auth.utils";
import { ErrorValidation } from "@/shared/lib/errorClasses";


interface LoginParams {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterParams {
  username: string;
  email: string;
  passwordOne: string;
  passwordTwo: string;
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
   checkAuthStatus: (): Promise<string> => {
      return authApi.checkStatus();
   },
   login: (params: LoginParams): Promise<{ _id: string }> => {
      const { username, password, rememberMe } = params;
      checkValidPassword(password);
      return authApi.login({ name: username, password, rememberMe });
   },
   logout: (): Promise<void> => {
      return authApi.logout();
   },
   register: (params: RegisterParams): Promise<{ _id: string }> => {
      const { username, email, passwordOne, passwordTwo } = params
      checkValidEmail(email);
      checkValidPassword(passwordOne);
      if (passwordOne != passwordTwo) { throw new ErrorValidation([{ field: 'passwords', issueList: ['do not match'] }]); }
      return authApi.register({ name: username, email, password: passwordOne });
   },
   requestPasswordReset: (params: RequestPasswordResetParams) => {
      const { email } = params;
      checkValidEmail(email);
      return authApi.requestPasswordReset({ email });
   },
   resetPassword: (params: ResetPasswordParams) => {
      const { passwordOne, passwordTwo, token } = params;
      checkValidPassword(passwordOne); // errors will handle any issue
      if (passwordOne !== passwordTwo) { throw new Error("Passwords do not match!"); }
      return authApi.resetPassword({password: passwordOne, token});
   }
}