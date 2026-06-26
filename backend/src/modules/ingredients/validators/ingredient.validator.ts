import { t } from "elysia";
import { NutritionValidator } from "../../../common/validators/nutrition.validator";
import { PostgresIdValidator } from "../../../common/validators/postgresId.validator";

export const IngredientValidator = t.Object({
   ingredient: t.Object({
      food_id: PostgresIdValidator.properties._id,
      description: t.String(),
      label: t.Optional(t.String()),
      commonName: t.Optional(t.String()),
      portion: t.Object({
         measure_id: t.Number(),
         description: t.String(),
         amount: t.Number()
      }),
      nutrition: t.Optional( NutritionValidator.properties.nutrition ),
   }),
});