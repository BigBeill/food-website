"use client"

import LoginPage from "@/features/auth/components/LoginPage";
import RequireNoAuth from "@/features/auth/components/RequireNoAuth";

export default function Login() {
   return (
      <RequireNoAuth>
         <LoginPage />
      </RequireNoAuth>
   );
}