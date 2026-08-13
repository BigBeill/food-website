import RequestPasswordResetPage from "@/features/auth/components/RequestPasswordResetPage";
import RequireNoAuth from "@/features/auth/components/RequireNoAuth";

export default function RequestDefaultPassword() {
   return (
      <RequireNoAuth>
         <RequestPasswordResetPage />
      </RequireNoAuth>
   );
}