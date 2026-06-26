import Elysia from "elysia";
import { ingredientsService } from "../../container";
import { SearchValidator } from "./validators/search.validator";
import { PostgresIdValidator } from "../../common/validators/postgresId.validator";
import { SearchConversionValidator } from "./validators/searchConversion.validator";

const service = ingredientsService;

export const ingredientsController = new Elysia({ prefix: '/recipes' })
   .get( '/get/:_id',
      async ({ params }) => {
         const { _id } = params;
         const ingredient = await service.getIngredient(_id);
         return { data: ingredient };
      },
      {
         params: PostgresIdValidator,
      }
   )
   .get( '/search',
      async ({ query }) => {
         const { description, food_group_id, skip = 0, limit = 32 } = query;
         const ingredientList = service.searchIngredient({ description, food_group_id, skip, limit });
         return { data: ingredientList };
      },
      {
         query: SearchValidator
      }
   )
   .get( '/searchConversion',
      async ({ query }) => {
         const { food_id, skip = 0, limit = 32  } = query;
         const conversionList = service.searchConversion(food_id, { skip, limit });
         return { data: conversionList };
      },
      {
         query: SearchConversionValidator,
      }
   )
   .get( '/searchGroup', 
      async () => {
         const groupList = await service.searchGroup({});
         return { data: groupList };
      }
   )