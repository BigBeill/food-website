
//? not real validation, this just tells the client in advance if a server will reject the request or not.
export function checkValidPassword(password: string): void {
   if (password.length < 6) { throw new Error("Password must be at least 6 characters long"); }
   if (password.length > 128) { throw new Error("Password must be less than 128 characters long"); }

   if (!/[a-z]/.test(password)) { throw new Error("Password must contain at least one lowercase letter"); }
   if (!/[A-Z]/.test(password)) { throw new Error("Password must contain at least one uppercase letter"); }
   if (!/[0-9]/.test(password)) { throw new Error("Password must contain at least one number"); }
   if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) { throw new Error("Password must contain at least one special character"); }

   if (/\s/.test(password)) { throw new Error("Password must not contain whitespace"); }
}

const ELYSIA_EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

export function checkValidEmail(email: string): void {
   if (!ELYSIA_EMAIL_REGEX.test(email)) {
      throw new Error(`Invalid email address`);
   }
}