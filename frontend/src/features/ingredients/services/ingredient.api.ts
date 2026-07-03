import sendServerRequest from "@/shared/lib/api";
import { IngredientGroupType, IngredientConversionType, IngredientType } from "../domain/ingredient.types";

interface searchParams {
   description?: string;
   groupId?: string;
   limit?: number;
}

export const ingredientApi = {
   conversionOptionList: (ingredientId: string) =>
      sendServerRequest<IngredientConversionType[]>({
         url: `/ingredient/conversionOptionList/${ingredientId}`,
         method: 'get',
      }),
   get: (ingredientId: string) =>
      sendServerRequest<IngredientType>({
         url: `/ingredient/get/${ingredientId}`,
         method: 'get',
      }),
   groupList: () =>
      sendServerRequest<IngredientGroupType[]>({
         url: `/ingredient/groupList`,
         method: 'get',
      }),
   search: (params: searchParams) => 
      sendServerRequest<IngredientType[]>({
         url: '/ingredient/search',
         method: 'get',
         body: params,
      }),
}