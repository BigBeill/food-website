import { useRouter } from 'next/router';
import { useState, useRef } from 'react';
import checkPasswordRequirements from '../domain/passwordRequirements';
import { authService } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';

interface ResetPasswordPageProps {
   uniqueString: string;
}
export default function ResetPasswordPage({ uniqueString }: ResetPasswordPageProps) {

   const router = useRouter();
   const { userId } = useAuth();
   if (userId) { router.replace('/'); }
   
   const errorRef = useRef(null);

   const [passwordOne, setPasswordOne] = useState<string>("");
   const [passwordTwo, setPasswordTwo] = useState<string>("");
   const [errorMessage, setErrorMessage] = useState<string>("");

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

      authService.resetPassword({uniqueString, password: passwordOne})

      router.replace('/login');
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