import EditRecipePage from "@/features/recipes/components/EditRecipePage"

export default async function EditRecipe({ params }: { params: Promise<{recipeId: string}> }) {
   const { recipeId } = await params;
   return <EditRecipePage recipeId={recipeId} />;
}