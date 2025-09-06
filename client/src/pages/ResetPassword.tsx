import { useEffect, useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import axios from '../api/axios';

export default function ResetPassword() {

   const navigate = useNavigate();
   const { userId } = useOutletContext<{userId: string}>();
   
   const hash = typeof window !== 'undefined' ? window.location.hash : '';
   console.log("hash:", hash);
   const uniqueString = new URLSearchParams(hash.replace(/^#/, '')).get('token') ?? undefined;
   console.log("uniqueString:", uniqueString);

   useEffect(() => {
      if (userId) navigate('/profile');
      document.body.classList.add('loginBackground');
      return () => { document.body.classList.remove('loginBackground'); }
   }, []);

   if (!uniqueString) { return <RequestReset />; }
   else { return <ChangePassword uniqueString={uniqueString} />; }
}

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
      if (!passwordOne || !passwordTwo) { return; }
      if (passwordOne !== passwordTwo) {
         setErrorMessage("passwords don't match");
         return;
      }

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
         <p ref={errorRef} className={errorMessage ? "error" : "hidden"} aria-live="assertive">{errorMessage}</p>
         <p>Need a new link?</p>
         <a href='/resetPassword'>Reset Password</a>
      </div>
   )
}