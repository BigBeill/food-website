import { RecipeType } from "../domain/recipes.types";
import { recipeApi } from "./recipes.api";

interface searchParams {
   title?: string
   ingredientIdList?: string; // use ',' to break up entries
   category?: "public" | "friends" | "personal"
   limit?: number;
   skip?: number;
   includeCount?: boolean;
   includeNutrition?: boolean;
}

export const recipeService = {
   get: (recipeId: string): Promise<RecipeType> => {
      return recipeApi.get(recipeId, { includeNutrients: true });
   },
   search: (params: searchParams): Promise<PaginatedListType<RecipeType>> => {
      return recipeApi.search(params);
   }
}