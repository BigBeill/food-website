import RequireAuth from "@/features/auth/components/RequireAuth";
import ProfilePage from "@/features/users/components/ProfilePage";

export default function Profile() {
   
   return (
      <RequireAuth>
         <ProfilePage />
      </RequireAuth>
   );
}