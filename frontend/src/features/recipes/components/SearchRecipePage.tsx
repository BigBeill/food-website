'use client'

import React, { useEffect, useState } from 'react';
import useNotebook from '@/shared/hooks/useNotebook';
import { RecipeType} from '@/features/recipes/domain/recipes.types';
import RecipePreview from '@/features/recipes/components/RecipePreview';
import FilterSearchPage from '@/features/recipes/components/FilterSearchPage';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { ingredientService } from '@/features/ingredients/services/ingredient.service';
import { recipeService } from '../services/recipe.service';
import useServiceState from '@/shared/lib/serviceState';
import { ErrorInsert, LoadingInsert } from '@/shared/components/stateComponents/InsertStateComponents';

interface SearchRecipePageProps {
   category?: "public" | "friends" | "personal"
}

interface ServiceDataType {
   title?: string;
   ingredientIdList: string[];
   category?: "public" | "friends" | "personal";
   limit?: number;
   skip?: number;
   includeNutrition?: boolean;
}

export default function SearchRecipePage({category}: SearchRecipePageProps) {

   const groupSize = 2

   // get url parameters
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const groupNumber: number = Number(searchParams.get('groupNumber')) || 1;

   const serviceData: ServiceDataType = {
      title: searchParams.get('title') || '',
      ingredientIdList: searchParams.get('ingredientIdList')?.split(',') ?? [],
      skip: ((groupSize * (groupNumber - 1)) - 1),
      limit: groupSize,
      includeNutrition: true,
   }

   const recipeListState = useServiceState(() => recipeService.search(serviceData), []);
   const ingredientListState = useServiceState(() => {
      return Promise.all(serviceData.ingredientIdList.map((ingredientId) => { return ingredientService.get(ingredientId); }))
   }, [serviceData.ingredientIdList])

   // send parameters to the url
   function handleFilterFormSubmit(title: string, ingredientList: IngredientType[]) {
      const newIngredientIdList: string[] = ingredientList.map((ingredient) => { return ingredient.food_id; });

      const params = new URLSearchParams();
      if(title) { params.append('title', title); }
      if(newIngredientIdList[0]) { params.append('ingredientIdList', newIngredientIdList.join(',')); }

      router.push(`${pathname}?${params.toString()}`);
   }

   function setGroupNumber(groupNumber: number) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('groupNumber', String(groupNumber));
      router.push(`${pathname}?${params.toString()}`);
   }

   const noteBook = useNotebook(setGroupNumber);

   // converts the contents of recipeList to a PageObject array and saving it to pageList
   useEffect(() => {
      let newPageList: React.ReactNode[] = [];
      let pageCount: number = 1;

      if (groupNumber == 1) {
         newPageList = [
            <FilterSearchPage 
               initialTitle={serviceData.title}
               initialIngredientListState={ingredientListState}
               handleSubmit={handleFilterFormSubmit}
            />
         ];
      }

      if (recipeListState.status === 'loading') { newPageList.push(<LoadingInsert />); }
      if (recipeListState.status !== 'ready') { newPageList.push(<ErrorInsert />); }
      else {
         recipeListState.data.list.forEach((recipe) => {
            newPageList.push(<RecipePreview recipe={recipe} />);
            pageCount = recipeListState.data.count
         });
      }


      noteBook.replaceComponentList(newPageList, {
         newComponentCount: pageCount,
         firstItemIndex: ((pageCount - 1) * 2)
      });
   }, [recipeListState.status, ingredientListState.status]);

   return noteBook.content
}