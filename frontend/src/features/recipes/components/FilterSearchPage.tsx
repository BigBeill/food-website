'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { useIngredientSearch } from '../../ingredients/hooks/useIngredientSearch';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { useEffect, useState } from 'react';
import { useIntractableList } from '@/shared/hooks/useIntractableList';
import { ServiceStateType } from '@/shared/shared.types';
import { InputText } from '@/shared/components/Input.components';
import { ButtonOval } from '@/shared/components/Button.components';
import { InsertError } from '@/shared/components/stateComponents/InsertStateComponents';

interface FilterSearchPageProps {
   initialTitle?: string;
   initialIngredientList?: IngredientType[];
   initialIngredientListState?: ServiceStateType<IngredientType[]>
   handleSubmit: (title: string, ingredientList: IngredientType[]) => void;
}

export default function FilterSearchPage({ initialTitle, initialIngredientList, initialIngredientListState, handleSubmit }: FilterSearchPageProps) {

   const listItemOptionsComponent = (item: IngredientType, index: number) => (
      <FontAwesomeIcon icon={faCircleXmark} onClick={ () => ingredientList.removeIndex(index) } />
   )

   const listItemContentComponent = (item: IngredientType, index: number) => (
      <p>{item.label || item.description}</p>
   )

   const [recipeTitle, setRecipeTitle] = useState<string>(initialTitle || '');
   const ingredientSearch = useIngredientSearch();
   const ingredientList = useIntractableList<IngredientType>({
      initial: initialIngredientList,
      renderItemOptions: listItemOptionsComponent,
      renderItemContent: listItemContentComponent,
   });

   function handleAddIngredient() {
      ingredientList.addItem(ingredientSearch.ingredient);
      ingredientSearch.reset();
   }

   useEffect(() => {
      if (initialIngredientListState?.status === 'ready') {
         ingredientList.replaceList(initialIngredientListState.data);
      }
   }, [initialIngredientListState?.status])

   return (
      <section className='consumeSpace'>
         <h1>Public Recipes</h1>

         <InputText label='Name' value={ recipeTitle } placeholder='recipe name' onChange={ (value) => setRecipeTitle(value) } />

         <div className='textInput sideButton additionalMargin'>
            <div className='activeSearchBar bottom'> {/* ingredient search bar */}
               <input 
                  type='text' 
                  value={ingredientSearch.ingredient.description} 
                  onChange={(event) => ingredientSearch.handleInputChange(event.target.value)} 
                  placeholder='Ingredient Name'
               />
               <ul className={`${ingredientSearch.optionList.length == 0 ? 'hidden' : ''}`}>
                  {ingredientSearch.optionList.map((ingredient, index) => (
                     <li key={index} onClick={() => ingredientSearch.selectIngredient(ingredient)}> {ingredient.commonName ? ingredient.commonName : ingredient.description} </li>
                  ))}
               </ul>
            </div>
            <div className='svgButtonContainer'>
               <FontAwesomeIcon icon={faCircleCheck} onClick={() => handleAddIngredient()}/>
            </div>
         </div>

         {
            initialIngredientListState?.status === 'loading' ? <InsertError />
            : initialIngredientListState?. status === 'error' ? <InsertError />
            : ingredientList.reactComponent
         }

         <ButtonOval onClick={ () => handleSubmit(recipeTitle, ingredientList.content()) }>search</ButtonOval>
      </section>
   )
}