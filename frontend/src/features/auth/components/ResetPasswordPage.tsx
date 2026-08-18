import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { ButtonOval } from '@/shared/components/Button.components';
import { useRouter } from 'next/navigation';
import styles from './login.module.scss';
import { InsertError } from '@/shared/components/stateComponents/InsertStateComponents';

interface FormDataType {
   passwordOne: string,
   passwordTwo: string,
   token: string,
}

export default function ResetPasswordPage({ token }: {token: string}) {

   const router = useRouter();

   const [formData, setFormData] = useState<FormDataType>({ passwordOne: "", passwordTwo: "", token})
   const resetPasswordMutator = useServiceMutation<FormDataType, void>((input) => authService.resetPassword(input))

   useEffect(() => {
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);
   
   useEffect(() => {
      if (resetPasswordMutator.status === "ready") { router.replace('/auth/login'); }
   }, [resetPasswordMutator.status]);

   useEffect(() => {
      resetPasswordMutator.resetToIdle();
   }, [formData])

   return (
      <div className={ styles.loginForm } id='resetPasswordForm'>
         <h1>Change Your Password</h1>
         <div className={ styles.textInputWrapper }>
            <input 
               type="password"
               name="newPassword"
               id="newPasswordOne"
               placeholder=' '
               onChange={(event) => { setFormData({ ...formData, passwordOne: event.target.value }) } }
               onKeyDown={(event) => { if (event.key === 'Enter') { resetPasswordMutator.send } }}
            />
            <label htmlFor="newPasswordOne">Enter New Password</label>
         </div>
         <div className={ styles.textInputWrapper }>
            <input 
               type="password"
               name="newPasswordConfirm"
               id="newPasswordTwo"
               placeholder=' '
               onChange={(event) => { setFormData({ ...formData, passwordTwo: event.target.value }) } }
               onKeyDown={(event) => { if (event.key === 'Enter') { resetPasswordMutator.send(formData) } }}
            />
            <label htmlFor="newPasswordTwo">Re-Enter New Password</label>
         </div>
         <ButtonOval 
            name="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={ () => { resetPasswordMutator.send(formData) } }
            loadingState={ resetPasswordMutator.status === 'loading' }
         > Change Password </ButtonOval>

         { resetPasswordMutator.status == 'error' &&
            <InsertError error={ resetPasswordMutator.error } />
         }

         <p>Need a new link?</p>
         <a href='/resetPassword'>Reset Password</a>
      </div>
   )
}