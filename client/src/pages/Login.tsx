import { useRef, useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom';

import axios from '../api/axios';

/**
 * Login form component that authenticates a user and redirects on success.
 *
 * Renders username and password inputs, a "Remember Me" checkbox, submit controls,
 * and links to register or reset password. On mount, redirects to '/profile' when
 * a `userId` is present in the outlet context and adds the `loginBackground` CSS
 * class to the document body (removed on unmount).
 *
 * Calling the form submit button or pressing Enter in either input will validate
 * inputs and POST `{ username, password, rememberMe }` to `authentication/login`.
 * On successful authentication the component navigates to '/' and reloads the page.
 * Validation and server-side errors are surfaced via an inline error message.
 *
 * @returns The rendered login form as a JSX.Element.
 */
function Login() {
   const errorRef = useRef(null);
   const navigate = useNavigate();
   const { userId } = useOutletContext<{userId: string}>();

   const [username, setUsername] = useState<string>("");
   const [password, setPassword] = useState<string>("");
   const [rememberMe, setRememberMe] = useState<boolean>(false);
   const [errorMessage, setErrorMessage] = useState<string>("");

   useEffect(() => {
      if (userId) navigate('/profile');
      document.body.classList.add('loginBackground');
      return () => { document.body.classList.remove('loginBackground'); }
   }, []);

   useEffect(() => {
      setErrorMessage("");
   }, [username, password]);

   function attemptLogin() {

      if (!username) return setErrorMessage("no username given");
      if (!password) return setErrorMessage("no password given");

      const userData = { username, password, rememberMe };
      axios({method: 'post', url: 'authentication/login', data: userData})
      .then(() => {
         navigate('/');
         window.location.reload();
      })
      .catch(response => { 
         if (response.error) {
            if (typeof response.error == "string") { setErrorMessage(response.error); }
            else if (Array.isArray(response.error) && response.error[0].msg) { setErrorMessage(response.error[0].msg); }
         }
      });
   }

   return (
      <>
         <div className="loginForm" id="loginForm">
         <h1>Login</h1>
         <div className="textInput">
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

         <div className="textInput">
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

         <div className="splitSpace">
            <div className="checkboxInput">
               <input type="checkbox"
               name="remember me"
               id="remember"
               value="1" 
               checked={rememberMe}
               onChange={(event) => setRememberMe(event.target.checked)}
               />
               <label htmlFor="remember">Remember Me</label>
            </div>
         </div>

         <button
            name="Submit"
            type="submit"
            id="submitButton"
            onClick={attemptLogin}
         > Login </button>
         <p ref={errorRef} className={errorMessage ? "error" : "hidden"} area-live="assertive">{errorMessage}</p>
         <p>Don&apos;t have an account?</p>
         <a href='/register'>create account</a>
         <p>------------</p>
         <p>Forgot your password?</p>
         <a href='/resetPassword'>reset password</a>

         </div>
      </>
   )
}

export default Login