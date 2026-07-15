import ValidationError from '@/shared/errorClasses/validationError';
import styles from '../styles/insertStateComponents.module.scss';
import Spinner from '../icons/spinner';

export function ErrorInsert () {
   return (
      <p className={ styles.error } aria-live='assertive'>
         Issue loading content, please try again.
      </p>
   )
}

export function InfoInsert ({ message }: { message: string }) {
   return (
      <p className={ styles.update } aria-live='assertive'>
         { message }
      </p>
   )
}

export function LoadingInsert () {
   return (
      <p className={ styles.warning } aria-live='assertive'> 
         <Spinner /> Your content is loading.
      </p>
   )
}

// takes a serviceStateType and inserts an error dive it he state reaches an error state
export function ValidationErrorInsert({ serviceState }: { serviceState: ServiceState<unknown> }) {
   
   // display nothing if service is not in an error state
   if (serviceState.status !== 'error') { return null; }

   return (
      <div className={styles.error} role="alert">
         { !(serviceState.error instanceof ValidationError) ?
            <>
               { console.error(serviceState.error) }
               <p>Something went wrong on our end. Please try again.</p>
            </>
         : 
            serviceState.error.errorList.map((error) => (
               <div key={error.field}>
                  <p>Invalid {error.field}:</p>
                  <ul>
                     { error.issueList.map((problem) => (
                        <li key={problem}>{problem}</li>
                     )) }
                  </ul>
               </div>
            )
         ) }
      </div>
   )
}