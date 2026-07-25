import { PaginatedListType } from "@/shared/shared.types";
import { RecipeDraft, RecipeType } from "../domain/recipes.types";
import { recipeApi } from "./recipes.api";
import { checkValidRecipe, createRecipeFormData } from "./recipes.utils";

interface SearchParams {
   title?: string
   ingredientIdList: number[];
   category?: "public" | "friends" | "personal"
   limit?: number;
   skip?: number;
   includeNutrition?: boolean;
}

export const recipeService = {
   create: (recipe: RecipeDraft, image?: File): Promise<void> => {
      checkValidRecipe(recipe);
      const recipeFormData = createRecipeFormData(recipe, image);
      return recipeApi.create(recipeFormData);
   },
   delete: (recipeId: string): Promise<void> => {
      return recipeApi.delete(recipeId);
   },
   get: (recipeId: string): Promise<RecipeType> => {
      return recipeApi.get(recipeId, { includeNutrients: true });
   },
   search: (params: SearchParams): Promise<PaginatedListType<RecipeType>> => {
      const { title, ingredientIdList, category, limit, skip, includeNutrition } = params;
      return recipeApi.search({ 
         ...(title ? { title } : null),
         ...(ingredientIdList.length === 0 ? { ingredientIdList: ingredientIdList.join(',') } : null), 
         category, 
         limit, 
         skip,
         includeNutrition 
      });
   },
   update: (recipe: RecipeType, image?: File): Promise<void> => {
      checkValidRecipe(recipe);
      const recipeFormData = createRecipeFormData(recipe, image);
      return recipeApi.update(recipe._id, recipeFormData);
   }
}