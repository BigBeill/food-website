import { IngredientGroupType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.service";
import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import Notebook from "@/shared/components/Notebook";
import preRenderService from "@/shared/lib/preRenderService";
import { PaginatedListType } from "@/shared/shared.types";

const groupSize = 5;

export default async function IngredientGroupPage() {
   const IngredientGroups = await preRenderService(() => ingredientService.searchGroup());

   return <IngredientGroupView ingredientGroups={ IngredientGroups } />
}

export function IngredientGroupView({ ingredientGroups }: { ingredientGroups: PaginatedListType<IngredientGroupType> }) {

   const notebookComponents: PaginatedListType<React.ReactElement> = { list: [], count: Math.ceil(ingredientGroups.count / groupSize), firstItemIndex: 0  };
   
   for (let groupStartIndex = 0; groupStartIndex < ingredientGroups.list.length; groupStartIndex += groupSize) {
      const ingredientGroupList = ingredientGroups.list.slice(groupStartIndex, groupStartIndex + groupSize);
      const itemList = ingredientGroupList.map((ingredientGroup) => { return { title: ingredientGroup.description, href: `/ingredients/${ ingredientGroup._id }` } });
      notebookComponents.list.push(<NotebookPageListItems key={ groupStartIndex } itemList={ itemList } />);
   }

   return <Notebook components={ notebookComponents } />
}