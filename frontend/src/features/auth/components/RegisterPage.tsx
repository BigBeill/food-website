// external imports
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '@/features/auth/hooks/useAuth';
import { authService } from '../services/auth.service';
import checkPasswordRequirements from '../domain/passwordRequirements';
import loginStyles from './login.module.scss';

export default function RegisterPage() {
   const errorRef = useRef(null);
   const router = useRouter();
   const { userId } = useAuth();

   const [activeRegisterAttempt, setActiveRegisterAttempt] = useState<boolean>(false);

   const [username, setUsername] = useState<string>("");
   const [email, setEmail] = useState<string>("");
   const [passwordOne, setPasswordOne] = useState<string>("");
   const [passwordTwo, setPasswordTwo] = useState<string>("");
   const [errorMessage, setErrorMessage] = useState<string>("");

   // monitor userId and redirect the page if it contains a value
   useEffect(() => {
      if (userId) { 
         router.replace('/');
         return;
      }
      document.body.classList.add('loginBackground');
      return () => { document.body.classList.remove('loginBackground'); }
   }, [userId]);

   // clean up any error message once the input has changed
   useEffect(() => {
      setErrorMessage("")
   }, [username, email, passwordOne, passwordTwo]);

   async function attemptRegister() {
      if (activeRegisterAttempt) { return; }

      if (!username) { return setErrorMessage("no username given"); }
      if (!email) { return setErrorMessage("no email given"); }
      if (!passwordOne) { return setErrorMessage("no password given"); }
      if (passwordOne != passwordTwo) { return setErrorMessage("passwords don't match"); }

      const missingPasswordRequirements: string | null = checkPasswordRequirements(passwordOne);
      if (missingPasswordRequirements) {
         setErrorMessage(missingPasswordRequirements);
         return;
      }

      setActiveRegisterAttempt(true);

      try {
         await authService.register({username, email, password: passwordOne});
         router.replace("/");
      }
      catch (error) {
         console.error(error);
      }
      finally {
         setActiveRegisterAttempt(false);
      }
   }

   return (
      <div className={loginStyles.loginForm} id="registerForm">
         <h1>Create Account</h1>

         <div className='textInput'>
            <input
               type="text"
               name="username"
               id="username"
               placeholder=' '
               value={username}
               onChange={(event) => setUsername(event.target.value)}
               onKeyDown={(event) => { if (event.key === 'Enter') { attemptRegister() } }}

            />
            <label htmlFor="username">Username</label>
         </div>

         <div className='textInput'>
            <input
               type="text"
               name="email"
               id="email"
               placeholder=' '
               value={email}
               onChange={(event) => setEmail(event.target.value)}
               onKeyDown={(event) => { if (event.key === 'Enter') { attemptRegister() } }}

            />
            <label htmlFor="email">Email</label>
         </div>

         <div className='textInput'>
            <input
               type="password"
               name="passwordOne"
               id="passwordOne"
               placeholder=' '
               value={passwordOne}
               onChange={(event) => setPasswordOne(event.target.value)}
               onKeyDown={(event) => { if (event.key === 'Enter') { attemptRegister() } }}
            />
            <label htmlFor="passwordOne">Password</label>
         </div>

         <div className='textInput'>
            <input
               type="password"
               name="passwordTwo"
               id="passwordTwo"
               placeholder=' '
               value={passwordTwo}
               onChange={(event) => setPasswordTwo(event.target.value)}
               onKeyDown={(event) => { if (event.key === 'Enter') { attemptRegister() } }}
            />
            <label htmlFor="passwordTwo">Confirm Password</label>
         </div>

         <button
            name="submit"
            id="submitButton"
            onClick={attemptRegister}
         > Create Account </button>

         <p ref={errorRef} className={errorMessage ? "error" : "hidden"} aria-live="assertive">{errorMessage}</p>

         <p>Already have an account?</p>
         <a href='/login'>Login</a>

      </div>
   )
}