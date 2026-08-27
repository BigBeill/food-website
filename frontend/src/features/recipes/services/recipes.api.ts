import sendServerRequest from "@/shared/lib/api";
import { RecipeType } from "../domain/recipes.types";
import { PaginatedListType } from "@/shared/shared.types";

interface getParams {
   includeNutrients?: boolean;
}

interface searchParams {
   title?: string;
   ownerIdList?: string[];
   ingredientIdList?: string[];
   visibilityList?: ('public' | 'private' | 'personal')[]
   limit?: number;
   skip?: number;
}

export const recipeApi = {
   create: (recipe: FormData): Promise<void> =>
      sendServerRequest({
         url: '/recipes/create',
         method: 'post',
         body: { recipe: recipe }
      }),
   
   delete: (recipeId: string): Promise<void> => 
      sendServerRequest({
         url: `/recipes/delete/${recipeId}`,
         method: 'delete'
      }),

   get: (recipeId: string, params?: getParams) =>
      sendServerRequest<RecipeType>({
         url:`/recipes/get/${recipeId}`,
         method: 'get',
         body: params,
      }),

   // under normal conditions this function will return RecipeType[], if count: true is passed in the params {count: number, list: RecipeType[]} will be returned
   search: (params: searchParams) => 
      sendServerRequest<PaginatedListType<RecipeType>>({
         url:`/recipes/search`,
         method: 'get',
         body: params,
      }),

   update: (recipeId: string, recipe: FormData): Promise<void> =>
      sendServerRequest({
         url:`/recipes/update/${recipeId}`,
         method: 'put',
         body: { recipe: recipe },
      })
}