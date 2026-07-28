import { useState } from "react";
import { IngredientType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.service";
import useServiceState from "@/shared/hooks/useServiceState";

export function useIngredientSearch() {
   const [ingredient, setIngredient] = useState<IngredientType>({ food_id: '', description: '' });
   const [searchTerm, setSearchTerm] = useState('');

   const ingredientSearchState = useServiceState(() => {
      if (searchTerm.length >= 3) { return ingredientService.search({ description: searchTerm }) }
      else { return Promise.resolve([]); }
   }, [searchTerm])

   const optionList = ingredientSearchState.status === 'ready' ? ingredientSearchState.data : [];

   function handleInputChange(partialName: string) {
      setIngredient({ food_id: '', description: partialName });
      setSearchTerm(partialName);
   }

   function selectIngredient(ingredient: IngredientType) {
      setSearchTerm('');
      setIngredient(ingredient);
   }

   function reset() {
      setIngredient({ food_id: '', description: '' });
   }

   return { 
      ingredient, 
      optionList, 
      handleInputChange, 
      selectIngredient,
      reset 
   };
}