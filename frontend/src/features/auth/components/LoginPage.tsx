import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import styles from './login.module.scss';
import { ButtonOval } from '@/shared/components/Buttons';

export default function LoginPage() {
   const errorRef = useRef(null);
   const router = useRouter();
   const { authId } = useAuth();

   // Tracks that a login attempt has been made and a response is being waited on
   const [activeLoginAttempt, setActiveLoginAttempt] = useState<boolean>(false);

   const [username, setUsername] = useState<string>("");
   const [password, setPassword] = useState<string>("");
   const [rememberMe, setRememberMe] = useState<boolean>(false);
   const [errorMessage, setErrorMessage] = useState<string>("");

   // monitor userId and redirect the page if it contains a value
   useEffect(() => {
      if (authId) { 
         router.replace('/');
         return;
      }
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, [authId]);

   // clean up any error message once the input has changed
   useEffect(() => {
      setErrorMessage("");
   }, [username, password]);

   async function attemptLogin() {
      // don't run this function while a login attempt has already been made
      if (activeLoginAttempt) { return; }

      if (!username) return setErrorMessage("no username provided");
      if (!password) return setErrorMessage("no password provided");

      setActiveLoginAttempt(true);

      try { 
         await authService.login({username, password, rememberMe}); 
         router.replace("/");
      }
      catch(error) {
         console.error(error); // CHANGE THIS TO USE setErrorMessage
      }
      setActiveLoginAttempt(false);
   }

   return (
      <div className={styles.loginForm} id="loginForm">
         <h1>Login</h1>
         <div className={styles.textInputWrapper}>
            <input
               type="text"
               name="username"
               id="username"
               placeholder=' '
               value={username}
               onChange={(event) => setUsername(event.target.value)}
               onKeyDown={(event) => { if (event.key === 'Enter') { attemptLogin() } }}
            />
            <label htmlFor="username">Username</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="password"
               name="password"
               id="password"
               placeholder=' '
               value={password}
               onChange={(event) => setPassword(event.target.value)}
               onKeyDown={(event) => { if (event.key === 'Enter') { attemptLogin() } }}
            />
            <label htmlFor="password">Password</label>
         </div>

         <div className={styles.checkboxInputWrapper}>
            <input type="checkbox"
            name="remember me"
            id="remember"
            value="1" 
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            />
            <label htmlFor="remember">Remember Me</label>
         </div>

         <ButtonOval
            name="Submit"
            type="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={attemptLogin}
         > Login </ButtonOval>
         <p ref={errorRef} className={errorMessage ? "error" : "hidden"} area-live="assertive" role="alert">{errorMessage}</p>
         <p>Don&apos;t have an account?</p>
         <a href='/auth/register'>create account</a>
         <p>------------</p>
         <p>Forgot your password?</p>
         <a href='/resetPassword'>reset password</a>

      </div>
   )
}