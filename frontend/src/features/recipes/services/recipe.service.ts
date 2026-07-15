import { RecipeType } from "../domain/recipes.types";
import { recipeApi } from "./recipes.api";

interface searchParams {
   title?: string
   ingredientIdList: string[];
   category?: "public" | "friends" | "personal"
   limit?: number;
   skip?: number;
   includeNutrition?: boolean;
}

export const recipeService = {
   get: (recipeId: string): Promise<RecipeType> => {
      return recipeApi.get(recipeId, { includeNutrients: true });
   },
   search: (params: searchParams): Promise<PaginatedListType<RecipeType>> => {
      const { title, ingredientIdList, category, limit, skip, includeNutrition } = params;
      return recipeApi.search({ 
         ...(title ? { title } : null),
         ...(ingredientIdList.length === 0 ? { ingredientIdList: ingredientIdList.join(',') } : null), 
         category, 
         limit, 
         skip,
         includeNutrition 
      });
   }
}