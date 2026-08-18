import { ingredientService } from "../services/ingredient.service";
import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import Notebook from "@/shared/components/Notebook";
import { PaginatedListType } from "@/shared/shared.types";
import { IngredientType } from "../domain/ingredient.types";
import preRenderService from "@/shared/lib/preRenderService";

const groupSize = 5;

export default async function IngredientListPage({ ingredientGroupId }: { ingredientGroupId: number }) {
   const ingredients = await preRenderService(() => ingredientService.search({ groupId: ingredientGroupId }));

   return <IngredientListView ingredientGroupId={ ingredientGroupId } ingredients={ ingredients } />
}

export function IngredientListView({ ingredientGroupId, ingredients }: { ingredientGroupId: number, ingredients: PaginatedListType<IngredientType> }) {

   const pageComponentList: React.ReactElement[] = [];

   for (let groupStartIndex = 0; groupStartIndex < ingredients.list.length; groupStartIndex += groupSize) {
      const ingredientGroupList = ingredients.list.slice(groupStartIndex, groupStartIndex + groupSize);
      const itemList = ingredientGroupList.map((ingredient) => { return { title: ingredient.description, href: `/ingredients/${ingredientGroupId}/${ ingredient.food_id }` } });
      pageComponentList.push(<NotebookPageListItems key={ groupStartIndex } itemList={ itemList } />);
   }

   return ( 
      <Notebook childrenCount={ ingredients.count / groupSize } >
         { ...pageComponentList }
      </Notebook>
   )
}