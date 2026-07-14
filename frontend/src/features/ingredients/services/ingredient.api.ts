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
         url: `/ingredients/conversionOptionList/${ingredientId}`,
         method: 'get',
      }),
   get: (ingredientId: string) =>
      sendServerRequest<IngredientType>({
         url: `/ingredients/get/${ingredientId}`,
         method: 'get',
      }),
   search: (params: searchParams) => 
      sendServerRequest<IngredientType[]>({
         url: '/ingredients/search',
         method: 'get',
         body: params,
      }),
   searchGroup: () =>
      sendServerRequest<IngredientGroupType[]>({
         url: `/ingredients/searchGroup`,
         method: 'get',
      }),
}