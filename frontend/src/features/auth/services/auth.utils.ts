
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