"use client"

import { ingredientService } from "../services/ingredient.service";
import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import Notebook from "@/shared/components/Notebook";
import { PaginatedListType } from "@/shared/shared.types";
import { IngredientType } from "../domain/ingredient.types";
import useServiceState from "@/shared/hooks/useServiceState";
import RequireServiceStateReady from "@/shared/components/RequireServiceStateReady";
import { useSearchParams } from "next/navigation";

const groupSize = 5;

export default function IngredientListPage({ ingredientGroupId }: { ingredientGroupId: number }) {

   const searchParams = useSearchParams()
   const groupNumber = searchParams.get('groupNumber');

   const ingredientState = useServiceState(() => {
      return ingredientService.search({ food_group_id: ingredientGroupId });
   }, [ingredientGroupId]);

   return ( 
      <RequireServiceStateReady serviceState={ ingredientState }>
         { (ingredients) => <IngredientListView ingredientGroupId={ ingredientGroupId } ingredients={ ingredients } /> }
      </ RequireServiceStateReady>
   );
}



interface ViewProps {
   ingredientGroupId: number;
   ingredients: PaginatedListType<IngredientType>;
}

export function IngredientListView({ ingredientGroupId, ingredients }: ViewProps) {

   const pageComponentList: React.ReactElement[] = [];

   for (let groupStartIndex = 0; groupStartIndex < ingredients.list.length; groupStartIndex += groupSize) {
      const ingredientGroupList = ingredients.list.slice(groupStartIndex, groupStartIndex + groupSize);
      const itemList = ingredientGroupList.map((ingredient) => { return { title: ingredient.description, href: `/ingredients/${ingredientGroupId}/${ ingredient.food_id }` } });
      pageComponentList.push(<NotebookPageListItems key={ groupStartIndex } itemList={ itemList } defaultListSize={ groupSize } />);
   }

   return ( 
      <Notebook childrenCount={ Math.ceil(ingredients.count / groupSize) } >
         { ...pageComponentList }
      </Notebook>
   )
}