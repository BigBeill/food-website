import { ingredientApi } from "./ingredient.api";
import { IngredientGroupType, IngredientType } from "../domain/ingredient.types";
import { PaginatedListType } from "@/shared/shared.types";

interface searchParams {
   description?: string;
   food_group_id?: number;
   skip?: number;
   limit?: number;
}

export const ingredientService = {
   conversionOptionList: (ingredientId: number) => {
      return ingredientApi.conversionOptionList(ingredientId);
   },
   get: (ingredientId: number): Promise<IngredientType> => {
      return ingredientApi.get(ingredientId);
   },
   search: (params: searchParams): Promise<PaginatedListType<IngredientType>> => {
      return ingredientApi.search(params);
   },
   searchGroup: (): Promise<PaginatedListType<IngredientGroupType>> => {
      return ingredientApi.searchGroup();
   },
}