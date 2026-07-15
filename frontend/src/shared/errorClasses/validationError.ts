interface ValidationErrorType {
   field: string
   issueList: string[]
}

export default class ValidationError extends Error {
   readonly errorList: ValidationErrorType[];

   constructor (validationErrorList: ValidationErrorType[]) {
      super('Form Validation Failed')
      this.name = 'Validation Error';
      this.errorList = validationErrorList
   }
}