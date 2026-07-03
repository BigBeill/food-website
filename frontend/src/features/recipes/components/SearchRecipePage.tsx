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

interface SearchRecipePageProps {
   category?: "public" | "friends" | "personal"
}
export default function SearchRecipePage({category}: SearchRecipePageProps) {

   // get url parameters
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   // collect params saved in the url
   const groupNumberParam: number = Number(searchParams.get('groupNumber')) || 1;
   const titleParam: string = searchParams.get('title') || '';
   const ingredientIdListParam: string[] = searchParams.get('ingredientIdList')?.split(',') ?? [];

   const [ingredientList, setIngredientList] = useState<IngredientType[]>([]);

   const [recipeList, setRecipeList] = useState<RecipeType[]>([]);
   const [recipeCount, setRecipeCount] = useState<number>(0);

   // send parameters to the url
   function handleSubmit(title: string, ingredientList: IngredientType[]) {
      const newIngredientIdList: string[] = ingredientList.map((ingredient) => { return ingredient.food_id; });

      const params = new URLSearchParams();
      if(title) { params.append('title', title); }
      if(newIngredientIdList[0]) { params.append('ingredientIdList', newIngredientIdList.join(',')); }

      router.push(`${pathname}?${params.toString()}`);
   }

   function updateGroupNumber(newGroupNumber: number) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('groupNumber', String(newGroupNumber));
      router.push(`${pathname}?${params.toString()}`);
   }

   async function requestNewPage(newPageNumber: number): Promise<void> {
      updateGroupNumber(Math.ceil((newPageNumber + 1) / 2));
   }

   const noteBook = useNotebook(requestNewPage);

   useEffect(() => {
      Promise.all(
         ingredientIdListParam.map((ingredientId) => {
            return ingredientService.get(ingredientId);
         })
      )
      .then((ingredientList: IngredientType[]) => {
         setIngredientList(ingredientList);
      })
      .catch((error) => console.error(error));
   }, [ingredientIdListParam]);

   // Fetch recipes from the server
   useEffect(() => {
      // Let ingredient list update before collecting more data from the server
      if (ingredientIdListParam.length != ingredientList.length) { return; } // TODO: Fix possible glitch where if the user removes one ingredient and adds another at the same time, ingredientIdList would be the same length causing this if check to fail and the useEffect to fire off twice

      let limit = 2;
      if (groupNumberParam == 1) { limit = 1; }

      const skip = ((groupNumberParam - 1) * 2) - 1;

      recipeService.search({title: titleParam, ingredientIdList: ingredientIdListParam.join(','), category, limit, skip, includeCount: true, includeNutrition: true})
      .then((response) => {
         const totalGroups = Math.ceil((response.count + 1) / 2)
         if (groupNumberParam > totalGroups) {
            updateGroupNumber(totalGroups);
         }
         else {
            setRecipeList(response.list);
            setRecipeCount(response.count);
         }
      })
      .catch((error) => {
         console.error(error);
      });
   }, [groupNumberParam, titleParam, ingredientList]);

   // converts the contents of recipeList to a PageObject array and saving it to pageList
   useEffect(() => {
      let newPageList: React.ReactNode[] = [];
      if (groupNumberParam == 1) {
         newPageList = [
            <FilterSearchPage 
               initialTitle={titleParam}
               initialIngredientList={ingredientList}
               handleSubmit={handleSubmit}
            />
         ];
      }

      recipeList.forEach((recipe) => {
         newPageList.push(
            <RecipePreview
               recipe={recipe}
            />
         );
      });

      noteBook.replaceComponentList(newPageList, {
         newComponentCount: recipeCount,
         firstItemIndex: ((groupNumberParam - 1) * 2)
      });
   }, [recipeList]);

   return noteBook.content
}