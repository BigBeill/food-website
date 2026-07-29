"use client"

import RequireAuth from "@/features/auth/components/RequireAuth";
import EditRecipePage from "@/features/recipes/components/EditRecipePage";

export default function NewRecipe() {
   return (
      <RequireAuth>
         <EditRecipePage />
      </RequireAuth>
   );
}