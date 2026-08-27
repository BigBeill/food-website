import { PaginatedListType } from "@/shared/shared.types";
import { RecipeDraft, RecipeType } from "../domain/recipes.types";
import { recipeApi } from "./recipes.api";
import { checkValidRecipeDraft, createRecipeFormData } from "./recipes.utils";

interface SearchParams {
   title?: string
   ingredientIdList?: number[];
   visibilityList?: ('public' | 'private' | 'personal')[];
   limit?: number;
   skip?: number;
}

export const recipeService = {
   create: (recipe: RecipeDraft): Promise<void> => {
      checkValidRecipeDraft(recipe);
      const recipeFormData = createRecipeFormData(recipe);
      return recipeApi.create(recipeFormData);
   },
   delete: (recipeId: string): Promise<void> => {
      return recipeApi.delete(recipeId);
   },
   get: (recipeId: string): Promise<RecipeType> => {
      return recipeApi.get(recipeId, { includeNutrients: true });
   },
   search: (params: SearchParams): Promise<PaginatedListType<RecipeType>> => {
      const { title, ingredientIdList, visibilityList, limit, skip } = params;
      return recipeApi.search({ 
         ...(title ? { title } : undefined),
         ...(ingredientIdList?.length !== 0 ? ingredientIdList : undefined), 
         visibilityList,
         limit,
         skip,
      });
   },
   update: (recipeId: string, recipe: RecipeDraft): Promise<void> => {
      checkValidRecipeDraft(recipe);
      const recipeFormData = createRecipeFormData(recipe);
      return recipeApi.update(recipeId, recipeFormData);
   }
}