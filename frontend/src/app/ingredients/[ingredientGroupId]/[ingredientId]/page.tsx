"use client"

import IngredientPage from "@/features/ingredients/components/IngredientPage";

export default async function IngredientList({ params }: { params: Promise<{ IngredientGroupId: string, ingredientId: string }> }) {
   const { ingredientId } = await params;
   return <IngredientPage ingredientId={ingredientId} />;
}