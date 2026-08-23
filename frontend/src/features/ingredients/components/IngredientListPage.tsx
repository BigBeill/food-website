"use client"

import { ingredientService } from "../services/ingredient.service";
import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import Notebook from "@/shared/components/Notebook";
import { BrokenPaginatedListType } from "@/shared/shared.types";
import useServiceState from "@/shared/hooks/useServiceState";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import combinePaginatedLists from "@/shared/lib/combinePaginatedLists";

const groupSize = 5;

interface PageProps {
   ingredientGroupId: number;
}

export default function IngredientListPage({ ingredientGroupId }: PageProps) {

   const searchParams = useSearchParams();
   const groupNumber = Number(searchParams.get('groupNumber')) || 1;

   const [notebookComponents, setNotebookComponents] = useState<BrokenPaginatedListType<React.ReactElement>>({ list: [], count: 0, firstItemIndex: 0 });

   useServiceState(async () => {
      console.log("collecting ingredients for group number", groupNumber);
      const ingredients = await ingredientService.search({ 
         food_group_id: ingredientGroupId, 
         skip: ((groupNumber - 1) * 2 * groupSize),
         limit: 10,
      });

      console.log("ingredients found:", ingredients);

      for (let i = 0; i < ingredients.list.length; i += groupSize) {
         const ingredientList = ingredients.list.slice(i, i + groupSize);
         const itemList = ingredientList.map((ingredient) => { 
            return { 
               title: ingredient.description, 
               href: `/ingredients/${ingredientGroupId}/${ ingredient.food_id }` 
            } 
         });
         setNotebookComponents((previous) => {
            const itemIndex = ((groupNumber - 1) * 2) + (Math.ceil(i / groupSize));
            return combinePaginatedLists(previous, {
               list: [<NotebookPageListItems key={ itemIndex } itemList={ itemList } defaultListSize={ groupSize } />],
               count: Math.ceil(ingredients.count / groupSize),
               firstItemIndex: itemIndex,
            })
         });
      }
   }, [groupNumber]);

   return <Notebook components={ notebookComponents } />
}