import { t } from "elysia";
import { paginationValidator } from "../../../common/validators/pagination.validator";
import { postgresIdValidator } from "../../../common/validators/postgresId.validator";

export const SearchValidator = t.Object({
   description: t.Optional(t.String()),
   food_group_id: t.Optional(postgresIdValidator.properties._id),
   ...paginationValidator.properties,
});