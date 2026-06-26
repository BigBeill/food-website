export default function checkPasswordRequirements(password: string): string | null {
   if (password.length < 6) return "Password must be at least 6 characters long.";
   if (password.length > 45) return "Password must be at most 45 characters long.";
   if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
   if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
   if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
   if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character.";
   return null;
}