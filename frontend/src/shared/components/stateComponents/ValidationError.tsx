import styles from '../styles/error.module.scss'

interface ValidationErrorType {
   field: string
   issueList: string[]
}

export class ValidationError extends Error {
   readonly errorList: ValidationErrorType[];

   constructor (validationErrorList: ValidationErrorType[]) {
      super('Form Validation Failed')
      this.name = 'Validation Error';
      this.errorList = validationErrorList
   }
}

// takes a serviceStateType and inserts an error dive it he state reaches an error state
export function ValidationErrorComponent({ serviceState }: { serviceState: ServiceState<unknown> }) {
   
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