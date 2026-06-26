import { useState } from 'react';
import { IngredientType } from '../domain/recipes.types';

export function useIngredientList(initial: IngredientType[] = []) {
   const [ingredientList, setIngredientList] = useState<IngredientType[]>(initial);

   function addIngredient(ingredient: IngredientType) {
      if (!ingredient.foodId) return;
      setIngredientList(list => [...list, ingredient]);
   }

   function removeIngredient(index: number) {
      setIngredientList(list => list.filter((_, i) => i !== index));
   }

   return { ingredientList, addIngredient, removeIngredient };
}