import { ingredientApi } from "./ingredient.api";
import { IngredientType } from "../domain/ingredient.types";

interface searchParams {
   description?: string;
   groupId?: string;
   limit?: number;
}

export const ingredientService = {
   get: (ingredientId: string): Promise<IngredientType> => {
      return ingredientApi.get(ingredientId);
   },
   search: (params: searchParams): Promise<IngredientType[]> => {
      return ingredientApi.search(params);
   }
}