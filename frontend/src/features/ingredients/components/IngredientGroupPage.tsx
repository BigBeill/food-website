import { IngredientGroupType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.service";
import { useRouter } from "next/navigation";
import useServiceState from "@/shared/hooks/useServiceState";
import RequireServiceStateReady from "@/shared/components/RequireServiceStateReady";
import { PaginatedListType } from "@/shared/shared.types";
import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import Notebook from "@/shared/components/Notebook";

const groupSize = 5;

export default function IngredientGroupPage() {

   const router = useRouter();

   const groupListState = useServiceState<PaginatedListType<IngredientGroupType>>(() => ingredientService.searchGroup(), [])

   return (
      <RequireServiceStateReady serviceState={ groupListState } >
         { (ingredientGroups) => {
            console.log(ingredientGroups);
            const pageComponentList: React.ReactElement[] = [];
            for (let groupStartIndex = 0; groupStartIndex < ingredientGroups.list.length; groupStartIndex += groupSize) {
               const ingredientGroupList = ingredientGroups.list.slice(groupStartIndex, groupStartIndex + groupSize);
               const itemList = ingredientGroupList.map((ingredientGroup) => { return { title: ingredientGroup.description, onClick: () => { router.push(`/ingredients/${ ingredientGroup._id }`); } } });
               pageComponentList.push(<NotebookPageListItems key={ groupStartIndex } itemList={ itemList } />);
            }

            return ( 
               <Notebook childrenCount={ ingredientGroups.count / groupSize } >
                  { ...pageComponentList }
               </Notebook>
            )
         } }
      </RequireServiceStateReady>
   );
}