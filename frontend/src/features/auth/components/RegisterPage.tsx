// external imports
import { useRef, useState, useEffect } from 'react';
import useAuth from '@/features/auth/hooks/useAuth';
import styles from './login.module.scss';
import { useRouter } from 'next/navigation';
import { ButtonOval } from '@/shared/components/Buttons';
import { authService } from '../services/auth.service';
import { useServiceMutation } from '@/shared/lib/serviceMutation';

interface FormDataType {
   username: string,
   email: string,
   passwordOne: string,
   passwordTwo: string,
}

export default function RegisterPage() {

   const errorRef = useRef(null);
   const router = useRouter();
   const { authId } = useAuth();

   const [formData, setFormData] = useState<FormDataType>({ username: "", email: "", passwordOne: "", passwordTwo: "" });
   const registerMutator = useServiceMutation<FormDataType, void>((input) => authService.register(input));
   
   useEffect(() => {
      if (authId) { router.replace('/'); }
   },[authId])

   useEffect(() => {
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

   useEffect(() => {
      if (registerMutator.state.status === "ready") { router.replace('/'); }
   }, [registerMutator.state]);

   return (
      <div className={styles.loginForm} id="registerForm">
         <h1>Create Account</h1>

         <div className={styles.textInputWrapper}>
            <input
               type="text"
               name="username"
               id="username"
               placeholder=' '
               value={ formData.username }
               onChange={ (event) => setFormData((data) => ({...data, username: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { registerMutator.send(formData) } } }
            />
            <label htmlFor="username">Username</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="text"
               name="email"
               id="email"
               placeholder=' '
               value={ formData.email }
               onChange={ (event) => setFormData((data) => ({ ...data, email: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { registerMutator.send(formData) } } }
            />
            <label htmlFor="email">Email</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="password"
               name="passwordOne"
               id="passwordOne"
               placeholder=' '
               value={ formData.passwordOne }
               onChange={ (event) => setFormData((data) => ({ ...data, passwordOne: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { registerMutator.send(formData) } } }
            />
            <label htmlFor="passwordOne">Password</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="password"
               name="passwordTwo"
               id="passwordTwo"
               placeholder=' '
               value={ formData.passwordTwo }
               onChange={ (event) => setFormData((data) => ({ ...data, passwordTwo: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { registerMutator.send(formData) } } }
            />
            <label htmlFor="passwordTwo">Confirm Password</label>
         </div>

         <ButtonOval
            name="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={ () => registerMutator.send(formData) }
         > Create Account </ButtonOval>

         { registerMutator.state.status === "error" ? 
            <p ref={errorRef} className='error' aria-live='assertive'>
               { registerMutator.state.error as string }
            </p> 
         : null}

         <p>Already have an account?</p>
         <a href='/auth/login'>Login</a>

      </div>
   )
}