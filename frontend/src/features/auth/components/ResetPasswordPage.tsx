import { useState } from "react";
import { authService } from "../services/auth.api";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

export default function RequestPasswordResetPage() {

   const router = useRouter();
   const { userId } = useAuth();
   if (userId) { router.replace('/'); }

   const [email, setEmail] = useState<string>("");
   const [requestSent, setRequestSent] = useState<boolean>(false);

   function sendResetRequest() {
      if (!email) { return; }
      
      try {
         authService.requestPasswordReset({ email });
         setRequestSent(true);
      }
      catch (error) {
         console.error(error);
      }
      
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