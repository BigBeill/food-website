'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { useIngredientSearch } from '../../ingredients/hooks/useIngredientSearch';
import { useIngredientList } from '../../ingredients/hooks/useIngredientList';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { useState } from 'react';
import { ErrorInsert, LoadingInsert } from '@/shared/components/stateComponents/InsertStateComponents';

interface FilterSearchPageProps {
   initialTitle?: string;
   initialIngredientList?: IngredientType[];
   initialIngredientListState?: ServiceState<IngredientType[]>
   handleSubmit: (title: string, ingredientList: IngredientType[]) => void;
}

export default function FilterSearchPage({ initialTitle, initialIngredientList, initialIngredientListState, handleSubmit }: FilterSearchPageProps) {

   if (initialIngredientListState) {
      if (initialIngredientListState.status === 'loading') { return <LoadingInsert /> }
      if (initialIngredientListState.status !== 'ready') { return <ErrorInsert />}
   }

   const [recipeTitle, setRecipeTitle] = useState<string>(initialTitle || '');
   const { newIngredient, ingredientsAvailable, handleInputChange, selectIngredient, reset } = useIngredientSearch();
   const { ingredientList, addIngredient, removeIngredient } = useIngredientList(initialIngredientList || initialIngredientListState?.data);

   function handleAddIngredient() {
      addIngredient(newIngredient);
      reset();
   }

   return (
      <div className='consumeSpace'>
         <h1>Public Recipes</h1>

         <div className='textInput additionalMargin'>
            <label>Name</label>
            <input type='text' value={recipeTitle} onChange={(event) => setRecipeTitle(event.target.value)} placeholder='recipe name' />
         </div>

         <div className='textInput sideButton additionalMargin'>
            <div className='activeSearchBar bottom'> {/* ingredient search bar */}
               <input 
                  type='text' 
                  value={newIngredient.description} 
                  onChange={(event) => handleInputChange(event.target.value)} 
                  placeholder='Ingredient Name'
               />
               <ul className={`${ingredientsAvailable.length == 0 ? 'hidden' : ''}`}>
                  {ingredientsAvailable.map((ingredient, index) => (
                     <li key={index} onClick={() => selectIngredient(ingredient)}> {ingredient.commonName ? ingredient.commonName : ingredient.description} </li>
                  ))}
               </ul>
            </div>
            <div className='svgButtonContainer'>
               <FontAwesomeIcon icon={faCircleCheck} onClick={() => handleAddIngredient()}/>
            </div>
         </div>

         <ul className='displayList'>
            {ingredientList.map((ingredient, index) => (
               <li key={index} className='listItem'>
                  <div className='options'>
                     <FontAwesomeIcon icon={faCircleXmark} style={{color: "#575757",}} onClick={() => removeIngredient(index)} />
                  </div>
                  <p>[{ingredient.foodDescription}]</p>
               </li>
            ))}
         </ul>

         <button className='additionalMargin' onClick={() => handleSubmit(recipeTitle, ingredientList)}> search </button>
      </div>
   )
}