import { useState } from "react";
import { IngredientType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.service";
import useServiceState from "@/shared/lib/serviceState";

export function useIngredientSearch() {
   const [newIngredient, setNewIngredient] = useState<IngredientType>({ food_id: '', description: '' });
   const [searchTerm, setSearchTerm] = useState('');

   const ingredientSearchState = useServiceState(() => {
      if (searchTerm.length >= 3) { return ingredientService.search({ description: searchTerm }) }
      else { return Promise.resolve([]); }
   }, [searchTerm])

   const ingredientsAvailable = ingredientSearchState.status === 'ready' ? ingredientSearchState.data : [];

   function handleInputChange(partialName: string) {
      setNewIngredient({ food_id: '', description: partialName });
      setSearchTerm(partialName);
   }


   function selectIngredient(ingredient: IngredientType) {
      setSearchTerm('');
      setNewIngredient(ingredient);
   }

   function reset() {
      setNewIngredient({ food_id: '', description: '' });
   }

   return { 
      newIngredient, 
      ingredientsAvailable, 
      handleInputChange, 
      selectIngredient, 
      reset 
   };
}