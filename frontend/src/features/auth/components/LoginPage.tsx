import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';
import styles from './login.module.scss';
import { ButtonOval } from '@/shared/components/Buttons';
import { authService } from '../services/auth.service';
import { useServiceMutation } from '@/shared/lib/serviceMutation';

interface FormDataType {
   username: string,
   password: string,
   rememberMe: boolean,
}

export default function LoginPage() {
   const errorRef = useRef(null);
   const router = useRouter();
   const { authId } = useAuth();

   const [formData, setFormData] = useState<FormDataType>({ username: "", password: "", rememberMe: false });
   const loginMutator = useServiceMutation<FormDataType, void>((input) => authService.login(input));

   useEffect(() => {
      if (authId) { router.replace('/'); }
   },[authId])

   useEffect(() => {
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

   useEffect(() => {
      if (loginMutator.state.status === "ready") { router.replace('/'); }
   }, [loginMutator.state]);

   return (
      <div className={styles.loginForm} id="loginForm">
         <h1>Login</h1>
         <div className={styles.textInputWrapper}>
            <input
               type="text"
               name="username"
               id="username"
               placeholder=' '
               value={ formData.username }
               onChange={ (event) => setFormData((data) => ({ ...data, username: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { loginMutator.send(formData) } } }
            />
            <label htmlFor="username">Username</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="password"
               name="password"
               id="password"
               placeholder=' '
               value={ formData.password }
               onChange={ (event) => setFormData((data) => ({ ...data, password: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { loginMutator.send(formData) } } }
            />
            <label htmlFor="password">Password</label>
         </div>

         <div className={styles.checkboxInputWrapper}>
            <input type="checkbox"
            name="remember me"
            id="remember"
            value="1" 
            checked={ formData.rememberMe }
            onChange={(event) => setFormData((data) => ({ ...data, rememberMe: event.target.checked })) }
            />
            <label htmlFor="remember">Remember Me</label>
         </div>

         <ButtonOval
            name="Submit"
            type="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={ () => loginMutator.send(formData) }
            loadingState={ loginMutator.state.status === 'loading' }
         > Login </ButtonOval>

         { loginMutator.state.status === "error" ? 
            <p ref={errorRef} className='error' aria-live='assertive'>
               { loginMutator.state.error.message }
            </p> 
         : null}
         
         <p>Don&apos;t have an account?</p>
         <a href='/auth/register'>create account</a>
         <p>------------</p>
         <p>Forgot your password?</p>
         <a href='/auth/resetPassword'>reset password</a>

      </div>
   )
}