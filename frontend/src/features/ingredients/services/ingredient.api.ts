import sendServerRequest from "@/shared/lib/api";
import { IngredientGroupType, IngredientConversionType, IngredientType } from "../domain/ingredient.types";
import { PaginatedListType } from "@/shared/shared.types";

interface searchParams {
   description?: string;
   food_group_id?: number;
   skip?: number;
   limit?: number;
}

export const ingredientApi = {
   conversionOptionList: (ingredientId: number) =>
      sendServerRequest<IngredientConversionType[]>({
         url: `/ingredients/conversionOptionList/${ingredientId}`,
         method: 'get',
      }),
   get: (ingredientId: number) =>
      sendServerRequest<IngredientType>({
         url: `/ingredients/get/${ingredientId}`,
         method: 'get',
      }),
   search: (params: searchParams) => 
      sendServerRequest<PaginatedListType<IngredientType>>({
         url: '/ingredients/search',
         method: 'get',
         body: params,
      }),
   searchGroup: () =>
      sendServerRequest<PaginatedListType<IngredientGroupType>>({
         url: `/ingredients/searchGroup`,
         method: 'get',
      }),
}