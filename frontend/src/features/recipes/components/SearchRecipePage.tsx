"use client"

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { recipeService } from '../services/recipes.service';
import useServiceState from '@/shared/hooks/useServiceState';
import Notebook from '@/shared/components/Notebook';
import NotebookPageListItems from '@/shared/components/notebookPageComponents/ListItems';
import RecipeFilterPage from './RecipeFilterPage';
import { BrokenPaginatedListType } from '@/shared/shared.types';
import combinePaginatedLists from '@/shared/lib/combinePaginatedLists';

const groupSize = 5

export default function SearchRecipePage() {

   const searchParams = useSearchParams();

   const title: string =  searchParams.get('title') || '';
   const ingredientIdListParam = searchParams.get('ingredientIdList');
   const category = searchParams.get('category') as "public" | "friends" | "personal" || 'public';
   const ingredientIdList = useMemo(() => { return ingredientIdListParam ? ingredientIdListParam.split(',').map(Number) : [] }, [ingredientIdListParam] );
   const groupNumber: number = Number(searchParams.get('groupNumber')) || 1;

   const [notebookComponents, setNotebookComponents] = useState<BrokenPaginatedListType<React.ReactElement>>({ list: [<RecipeFilterPage />], count: 1, firstItemIndex: 0 });

   useServiceState(async () => {
      const response = await recipeService.search({
         title,
         visibilityList: ['public', 'private', 'personal'],
         ingredientIdList,
         skip: ((groupSize * (groupNumber - 1))),
         limit: (groupNumber == 1 ? groupSize : groupSize * 2)
      });

      let newComponents = []

      for (let i = 0; i < response.list.length; i += groupSize) {
         const recipeList = response.list.slice(i, i + groupSize);
         const itemList = recipeList.map((recipe) => { return { title: recipe.title, image: recipe.image, href: `/recipes/${ recipe._id }` } });
         newComponents.push(<NotebookPageListItems itemList={ itemList } defaultListSize={ groupSize } />);
      }

      setNotebookComponents((previous) => { return combinePaginatedLists(previous, { list: newComponents,  count: Math.ceil(response.count / groupSize), firstItemIndex: ((groupNumber - 1) * 2) + 1 }) });

   }, [searchParams]);

   return (
      <Notebook components={ notebookComponents } />
   );
}