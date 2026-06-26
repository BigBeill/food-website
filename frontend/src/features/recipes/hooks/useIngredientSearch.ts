import { useState } from "react";
import { searchIngredients } from "../services/ingredient.service";
import { IngredientType } from "../domain/recipes.types";

export function useIngredientSearch() {
   const [newIngredient, setNewIngredient] = useState<IngredientType>({ foodId: '', foodDescription: '' });
   const [ingredientsAvailable, setIngredientsAvailable] = useState<IngredientType[]>([]);

   function handleInputChange(partialName: string) {
      setNewIngredient({ foodId: '', foodDescription: partialName });
      if (partialName.length < 3) {
         setIngredientsAvailable([]);
         return;
      }

      searchIngredients(partialName)
      .then ((response) => { setIngredientsAvailable(response); })
      .catch ((error) => { console.error('unable to fetch ingredients:', error); })
   }

   function selectIngredient(ingredient: IngredientType) {
      setIngredientsAvailable([]);
      setNewIngredient(ingredient);
   }

   function reset() {
      setNewIngredient({ foodId: '', foodDescription: '' });
   }

   return { newIngredient, ingredientsAvailable, handleInputChange, selectIngredient, reset };
}