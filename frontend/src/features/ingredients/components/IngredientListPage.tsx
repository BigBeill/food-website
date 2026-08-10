import { IngredientType } from "../domain/ingredient.types";
import { useRouter } from "next/router";
import useServiceState from "@/shared/hooks/useServiceState";
import { ingredientService } from "../services/ingredient.service";
import RequireServiceStateReady from "@/shared/components/RequireServiceStateReady";
import { usePathname } from "next/navigation";
import { PaginatedListType } from "@/shared/shared.types";
import NotebookPageListItems from "@/shared/components/useNotebookComponents/ListItems";
import Notebook from "@/shared/components/Notebook";

const groupSize = 5;

export default function IngredientListPage({ ingredientGroupId }: { ingredientGroupId: number }) {

   const router = useRouter();

   const ingredientListState = useServiceState(() => {
      return ingredientService.search({ groupId: ingredientGroupId });
   }, [ingredientGroupId]);

   return (
      <RequireServiceStateReady serviceState={ ingredientListState } >
         { (ingredients) => {
            const pageComponentList: React.ReactElement[] = [];
            for (let groupStartIndex = 0; groupStartIndex < ingredients.list.length; groupStartIndex += groupSize) {
               const ingredientGroupList = ingredients.list.slice(groupStartIndex, groupStartIndex + groupSize);
               const itemList = ingredientGroupList.map((ingredient) => { return { title: ingredient.description, onClick: () => { router.push(`/ingredients/${ingredientGroupId}/${ ingredient.food_id }`); } } });
               pageComponentList.push(<NotebookPageListItems key={ groupStartIndex } itemList={ itemList } />);
            }

            return ( 
               <Notebook childrenCount={ ingredients.count / groupSize } >
                  { ...pageComponentList }
               </Notebook>
            )
         } }
      </RequireServiceStateReady>
   )
}