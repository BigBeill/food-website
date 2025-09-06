import { useEffect, useState, useRef } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

import axios from '../api/axios';

/**
 * Renders the password reset page, either showing a reset-request form or a change-password form.
 *
 * On mount, redirects to `/profile` if a user is already signed in and adds the `loginBackground`
 * class to document.body; the class is removed on unmount. If the URL contains a `uniqueString`
 * parameter the component renders the ChangePassword view (passing `uniqueString`), otherwise it
 * renders the RequestReset view.
 *
 * @returns The ResetPassword page React element.
 */
export default function ResetPassword() {

   const navigate = useNavigate();
   const { userId } = useOutletContext<{userId: string}>();
   const { uniqueString } = useParams<{uniqueString: string}>();

   useEffect(() => {
      if (userId) navigate('/profile');
      document.body.classList.add('loginBackground');
      return () => { document.body.classList.remove('loginBackground'); }
   }, []);

   if (!uniqueString) { return <RequestReset />; }
   else { return <ChangePassword uniqueString={uniqueString} />; }
}

/**
 * Renders a form to request a password-reset link and handles submitting the request.
 *
 * Displays an email input and "Request Reset Link" button; after a successful submission attempt
 * the UI shows a confirmation message (regardless of whether the email exists). If the email
 * field is empty the submission is ignored. On submit the component sends a POST to
 * `authentication/requestPasswordReset` and logs any errors to the console.
 *
 * @returns The JSX for the request-reset form or a sent-confirmation message.
 */
function RequestReset() {

   const [email, setEmail] = useState<string>("");
   const [requestSent, setRequestSent] = useState<boolean>(false);

   function sendResetRequest() {
      if (!email) return;
      setRequestSent(true);
      axios({ method: 'post', url: 'authentication/requestPasswordReset', data: { email } })
      .catch((error) => { console.error(error); });
   }

   return (
      <div className='loginForm' id='resetPasswordForm'>
         <h1>Request a Password Reset Link</h1>
         { requestSent ? 
            <p>A reset link has been sent to your email, if your email exists in our system you will receive it shortly.</p> 
         : <>
            <div className='textInput'>
               <input 
                  type="text"
                  name="email"
                  id="email"
                  placeholder=' '
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') { sendResetRequest() } }}
               />
               <label htmlFor="email">Enter Your Email</label>
            </div>

            <button onClick={sendResetRequest}> Request Reset Link </button>
         </> }
      </div>
   )
}

interface ChangePasswordProps {
   uniqueString: string;
}

/**
 * Renders a "Change Your Password" form that lets a user set a new password using a reset token.
 *
 * Displays two password fields, validates that they match and meet strength rules (6–45 chars, at least one lowercase, one uppercase, one digit, and one of !@#$%^&*), and submits the new password to the backend using the provided `uniqueString` token. On successful response the component navigates to `/login`; on failure it surfaces a user-facing error message. Empty or non-matching inputs are ignored (no submission).
 *
 * @param uniqueString - The password-reset token taken from the URL; sent to the server to authorize the password change.
 * @returns A React element containing the password inputs, submit button, inline error area, and a link to request a new reset link.
 */
function ChangePassword({ uniqueString }: ChangePasswordProps) {
   
   const errorRef = useRef(null);
   const navigate = useNavigate();

   const [passwordOne, setPasswordOne] = useState<string>("");
   const [passwordTwo, setPasswordTwo] = useState<string>("");
   const [errorMessage, setErrorMessage] = useState<string>("");

   function checkPasswordRequirements(password: string) {
      let regex: RegExp;

      if (password.length < 6) { return "Password must be at least 6 characters long."; }
      if (password.length > 45) { return "Password must be at most 45 characters long."; }

      regex = /[a-z]/; // check for lowercase letters
      if (!regex.test(password)) { return "Password must contain at least one lowercase letter."; }

      regex = /[A-Z]/; // check for uppercase letters
      if (!regex.test(password)) { return "Password must contain at least one uppercase letter."; }

      regex = /[0-9]/; // check for numbers
      if (!regex.test(password)) { return "Password must contain at least one number."; }

      regex = /[!@#$%^&*]/; // check for special characters
      if (!regex.test(password)) { return "Password must contain at least one special character."; }

      return null;
   }

   function changePassword() {
      if (!passwordOne || !passwordTwo) return;
      if (passwordOne !== passwordTwo) return;

      const missingPasswordRequirements: string | null = checkPasswordRequirements(passwordOne);
      if (missingPasswordRequirements) {
         setErrorMessage(missingPasswordRequirements);
         return;
      }

      axios({ method: 'post', url: 'authentication/changePassword', data: { uniqueString, password: passwordOne } })
      .then(() => { navigate('/login'); })
      .catch((error) => { 
         setErrorMessage("server error, reset link may have expired");
         console.error(error); 
      });
   }

   return (
      <div className='loginForm' id='resetPasswordForm'>
         <h1>Change Your Password</h1>
         <div className='textInput'>
            <input 
               type="password"
               name="newPassword"
               id="newPasswordOne"
               placeholder=' '
               onChange={(event) => { setPasswordOne(event.target.value) } }
               onKeyDown={(event) => { if (event.key === 'Enter') { changePassword() } }}
            />
            <label htmlFor="newPasswordOne">Enter New Password</label>
         </div>
         <div className='textInput'>
            <input 
               type="password"
               name="newPasswordConfirm"
               id="newPasswordTwo"
               placeholder=' '
               onChange={(event) => { setPasswordTwo(event.target.value) } }
               onKeyDown={(event) => { if (event.key === 'Enter') { changePassword() } }}
            />
            <label htmlFor="newPasswordTwo">Re-Enter New Password</label>
         </div>
         <button onClick={changePassword}> Change Password </button>
         <p ref={errorRef} className={errorMessage ? "error" : "hidden"} area-live="assertive">{errorMessage}</p>
         <p>Need a new link?</p>
         <a href='/resetPassword'>Reset Password</a>
      </div>
   )
}