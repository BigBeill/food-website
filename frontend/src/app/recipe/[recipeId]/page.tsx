import RecipePage from "@/features/recipes/components/RecipePage";

export default async function Recipe({ params }: { params: Promise<{recipeId: string}> }) {
   const { recipeId } = await params;
   return <RecipePage recipeId={recipeId} />;
}