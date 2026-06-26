import { t } from "elysia";
import { paginationValidator } from "../../../common/validators/pagination.validator";
import { postgresIdValidator } from "../../../common/validators/postgresId.validator";

export const SearchConversionValidator = t.Object({
   food_id: postgresIdValidator.properties._id,
   ...paginationValidator.properties,
});