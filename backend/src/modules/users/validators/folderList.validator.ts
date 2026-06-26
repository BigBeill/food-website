import { t } from "elysia";
import { IdValidator } from "../../../common/validators/id.validator";
import { PaginationValidator } from "../../../common/validators/pagination.validator";

export const FolderListValidator = t.Object({
   parentId: IdValidator.properties._id,
   ...PaginationValidator.properties,
});