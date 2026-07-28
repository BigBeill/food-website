import styles from '../styles/insertStateComponents.module.scss';
import Spinner from '../icons/spinner';
import { ErrorValidation } from '@/shared/lib/errorClasses';

export function InsertError({ error }: { error?: Error }) {
   return (
      <div className={ styles.error } aria-live='assertive'>
         { error instanceof ErrorValidation ?
            error.errorList.map((error) => (
               <div key={error.field}>
                  <p>Invalid {error.field}:</p>
                  <ul>
                     { error.issueList.map((problem) => (
                        <li key={problem}>{problem}</li>
                     )) }
                  </ul>
               </div>
            ))
         :
            <>
               { console.error(error) }
               <p>Issue loading content, please try again.</p>
            </>
         }
      </div>
   )
}

export function InsertInfo ({ message }: { message: string }) {
   return (
      <p className={ styles.update } aria-live='assertive'>
         { message }
      </p>
   )
}

export function InsertLoading () {
   return (
      <p className={ styles.warning } aria-live='assertive'> 
         <Spinner /> Your content is loading.
      </p>
   )
}