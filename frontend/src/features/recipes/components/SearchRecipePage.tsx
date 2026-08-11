import React, { useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { recipeService } from '../services/recipes.service';
import useServiceState from '@/shared/hooks/useServiceState';
import Notebook from '@/shared/components/Notebook';
import RequireServiceStateReady from '@/shared/components/RequireServiceStateReady';
import NotebookPageListItems from '@/shared/components/notebookPageComponents/ListItems';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { ButtonIconList, ButtonOval } from '@/shared/components/Button.components';
import { useInteractableList } from '@/shared/hooks/useInteractableList';
import { DataHandle } from '@/shared/shared.types';
import { InputText } from '@/shared/components/Input.components';
import IngredientSearch from '@/features/ingredients/components/IngredientSearch';
import { ingredientService } from '@/features/ingredients/services/ingredient.service';

const groupSize = 2

interface SearchRecipePageProps {
   category?: "public" | "friends" | "personal"
}

interface ServiceDataType {
   title?: string;
   ingredientIdList: number[];
   category?: "public" | "friends" | "personal";
   limit?: number;
   skip?: number;
   includeNutrition?: boolean;
}

export default function SearchRecipePage({category}: SearchRecipePageProps) {
   const router = useRouter();
   const searchParams = useSearchParams();

   const title: string =  searchParams.get('title') || '';
   const groupNumber: number = Number(searchParams.get('groupNumber')) || 1;
   const ingredientIdListParam = searchParams.get('ingredientIdList');
   const ingredientIdList = useMemo(() => { return ingredientIdListParam ? ingredientIdListParam.split(',').map(Number) : [] }, [ingredientIdListParam] );

   const filterPage = <FilterPage title={ title } ingredientIdList={ ingredientIdList } />

   const serviceData: ServiceDataType = {
      title: searchParams.get('title') || '',
      category,
      ingredientIdList,
      skip: ((groupSize * (groupNumber - 1)) - 1),
      limit: groupSize,
   }

   const recipeListState = useServiceState(() => recipeService.search(serviceData), [serviceData]);

   return (
      <RequireServiceStateReady serviceState={ recipeListState }>
         { (recipes) => {
            const pageComponentList: React.ReactElement[] = [];
            for (let groupStartIndex = 0; groupStartIndex < recipes.list.length; groupStartIndex += groupSize) {
               const recipeList = recipes.list.slice(groupStartIndex, groupStartIndex + groupSize);
               const itemList = recipeList.map((recipe) => { return { title: recipe.title, image: recipe.image, onClick: () => { router.push(`/recipes/${ recipe._id }`); } } });
               pageComponentList.push(<NotebookPageListItems itemList={ itemList } />);
            }

            return (
               <Notebook childrenCount={ (recipes.count / groupNumber) + 1 } firstChildIndex={ recipes.firstItemIndex }>
                  { (groupNumber === 1) && filterPage }
                  { ...pageComponentList }
               </Notebook>
            );
         } }
      </RequireServiceStateReady>
   );
}



interface FilterPageProps {
   title?: string;
   ingredientIdList?: number[];
}

function FilterPage({ title = "", ingredientIdList = [] }: FilterPageProps) {

   const ingredientListState = useServiceState(() => { return Promise.all(ingredientIdList.map((ingredientId) => { return ingredientService.get(ingredientId); })) }, [ingredientIdList]);

   return (
      <RequireServiceStateReady serviceState={ ingredientListState }>
         { (ingredientList) => <FilterSearchView title={ title } ingredientList={ ingredientList }/> }
      </RequireServiceStateReady>
   );
}



interface FilterSearchViewProps {
   title: string,
   ingredientList: IngredientType[],
}

function FilterSearchView({ title, ingredientList }: FilterSearchViewProps) {

   const inputTitleRef = useRef<DataHandle<string>>(null);

   const interactableList = useInteractableList<IngredientType>({
      initial: ingredientList,
      renderItemOptions: (item, index, listActions) => <ButtonIconList iconList={ [{ icon: faCircleXmark, label: "Remove item", onClick: () => listActions.removeIndex(index) }] } />,
      renderItemContent: (item: IngredientType) => <p>{item.label || item.description}</p>,
   });

   function handleSubmit() {
      const updatedParams = new URLSearchParams()
      const title = inputTitleRef.current!.getData()
      const ingredientList = interactableList.content;
      if(title) { updatedParams.set('title', title); }
      if(ingredientList.length !== 0) { updatedParams.set('ingredientIdList', ingredientList.map((ingredient) => ingredient.food_id).join(',')); }
      window.history.replaceState(null, '', `?${ updatedParams.toString() }`);
   }

   return (
      <section className='consumeSpace'>
         <h1>Public Recipes</h1>

         <InputText label='Name' value={ title } dataRef={ inputTitleRef } placeholder='recipe name' />
         <IngredientSearch onSubmit={ (ingredient: IngredientType) => interactableList.addItem(ingredient) } />

         <ButtonOval onClick={ () => handleSubmit() }>search</ButtonOval>
      </section>
   )
}