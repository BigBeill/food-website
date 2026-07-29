"use client"

import RequireAuth from "@/features/auth/components/RequireAuth";
import EditRecipePage from "@/features/recipes/components/EditRecipePage"

export default async function EditRecipe({ params }: { params: Promise<{recipeId: string}> }) {
   const { recipeId } = await params;

   return (
      <RequireAuth>
         <EditRecipePage recipeId={recipeId} />;
      </RequireAuth>
   )
}