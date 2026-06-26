import sendServerRequest from "@/shared/lib/api";
import { RecipeType } from "../domain/recipes.types";

interface createParams {
   recipe: FormData;
}

interface getParams {
   includeNutrients?: boolean;
}

interface searchParams {
   title?: string
   ingredientIdList?: string; // use ',' to break up entries
   category?: "public" | "friends" | "personal"
   limit?: number;
   skip?: number;
   includeCount?: boolean;
   includeNutrition?: boolean;
}

interface updateParams {
   recipe: FormData;
}

export const recipeService = {
   create: (params: createParams) =>
      sendServerRequest({
         url: '/recipe/create',
         method: 'post',
         body: params
      }),
   
   delete: (recipeId: string) => 
      sendServerRequest({
         url: `/recipe/delete/${recipeId}`,
         method: 'delete'
      }),

   get: (recipeId: string, params?: getParams) =>
      sendServerRequest<RecipeType>({
         url:`/recipe/get/${recipeId}`,
         method: 'get',
         body: params,
      }),

   // under normal conditions this function will return RecipeType[], if count: true is passed in the params {count: number, list: RecipeType[]} will be returned
   search: (params: searchParams) => 
      sendServerRequest<RecipeType[] | {count: number, list: RecipeType[]}>({
         url:`/recipe/search`,
         method: 'get',
         body: params,
      }),

   update: (recipeId: string, params: updateParams) =>
      sendServerRequest({
         url:`/recipe/update/${recipeId}`,
         method: 'put',
         body: params,
      })
}