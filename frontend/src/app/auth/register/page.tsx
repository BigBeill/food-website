import RegisterPage from "@/features/auth/components/RegisterPage";
import RequireNoAuth from "@/features/auth/components/RequireNoAuth";

export default function register() {
   return (
      <RequireNoAuth>
         <RegisterPage />
      </RequireNoAuth>
   )
}