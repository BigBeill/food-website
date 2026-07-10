import { useRef, useEffect, useState } from 'react';
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
      // set background
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

   useEffect(() => {
      requestPasswordResetMutator.resetToIdle();
   }, [formData])

   return (
      <div className={ styles.loginForm } id='resetPasswordForm'>
         <h1>Change Your Password</h1>
         <div className={ styles.textInputWrapper }>
            <input 
               type="email"
               name="newEmail"
               id="newEmail"
               placeholder=' '
               value={ formData.email }
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
            loadingState={ requestPasswordResetMutator.state.status === 'loading' }
         >Change Password</ButtonOval>
         
         { requestPasswordResetMutator.state.status === "error" ? 
            <p ref={errorRef} className='error' aria-live='assertive'>
               { requestPasswordResetMutator.state.error.message }
            </p> 
         : null}

         { requestPasswordResetMutator.state.status === "ready" ?
            <p className='update' aria-live='assertive'>
               A password reset link has been sent to your email
            </p>
         : null}
      </div>
   )
}