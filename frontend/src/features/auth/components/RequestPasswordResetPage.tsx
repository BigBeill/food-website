import { useState, useRef, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { useServiceMutation } from '@/shared/lib/serviceMutation';
import { ButtonOval } from '@/shared/components/Buttons';
import styles from './login.module.scss';
import { useRouter } from 'next/navigation';

interface FormDataType {
   email: string
}

export default function RequestPasswordResetPage() {

   const errorRef = useRef(null);
   const router = useRouter();
   const { authId } = useAuth();

   const [formData, setFormData] = useState<FormDataType>({ email: "" });
   const requestPasswordResetMutator = useServiceMutation<FormDataType, void>((input) => authService.requestPasswordReset(input));
   
   useEffect(() => {
      if (authId) { router.replace('/'); }
   },[authId])

   useEffect(() => {
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

   useEffect(() => {
      if (requestPasswordResetMutator.state.status === "ready") { router.replace('/auth/login'); }
   }, [requestPasswordResetMutator.state]);

   return (
      <div className={ styles.loginForm } id='resetPasswordForm'>
         <h1>Change Your Password</h1>
         <div className={ styles.textInputWrapper }>
            <input 
               type="email"
               name="newEmail"
               id="newEmail"
               placeholder=' '
               onChange={(event) => { setFormData({ ...formData, email: event.target.value }) } }
               onKeyDown={(event) => { if (event.key === 'Enter') { requestPasswordResetMutator.send } }}
            />
            <label htmlFor="newEmail">Enter Your Email</label>
         </div>

         <ButtonOval 
            name="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={ () => { requestPasswordResetMutator.send(formData) } }
         >Change Password</ButtonOval>
         
         { requestPasswordResetMutator.state.status === "error" ? 
            <p ref={errorRef} className='error' aria-live='assertive'>
               { requestPasswordResetMutator.state.error.message }
            </p> 
         : null}

         { requestPasswordResetMutator.state.status === "ready" ?
            <p className='update' aria-live='assertive'>
               A password reset request has been sent to your email
            </p>
         : null}

         <p>Need a new link?</p>
         <a href='/resetPassword'>Reset Password</a>
      </div>
   )
}