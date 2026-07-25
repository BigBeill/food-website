import { ingredientApi } from "./ingredient.api";
import { IngredientGroupType, IngredientType } from "../domain/ingredient.types";

interface searchParams {
   description?: string;
   groupId?: number;
   limit?: number;
}

export const ingredientService = {
   conversionOptionList: (ingredientId: number) => {
      return ingredientApi.conversionOptionList(ingredientId);
   },
   get: (ingredientId: number): Promise<IngredientType> => {
      return ingredientApi.get(ingredientId);
   },
   search: (params: searchParams): Promise<IngredientType[]> => {
      return ingredientApi.search(params);
   },
   searchGroup: (): Promise<IngredientGroupType[]> => {
      return ingredientApi.searchGroup();
   },
}