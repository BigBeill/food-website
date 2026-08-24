import { useState } from "react";
import { IngredientType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.service";
import useServiceState from "@/shared/hooks/useServiceState";
import { InputText } from "@/shared/components/Input.components";
import { ButtonIconList } from "@/shared/components/Button.components";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

interface IngredientSearchParams {
   onSubmit: (ingredient: IngredientType) => void;
   includePortion?: boolean
}
export default function IngredientSearch({ onSubmit, includePortion = false }: IngredientSearchParams) {
   const [ingredient, setIngredient] = useState<IngredientType>({ food_id: 0, description: '' });
   const [searchTerm, setSearchTerm] = useState('');

   const ingredientSearchState = useServiceState(() => {
      if (searchTerm.length >= 3) { return ingredientService.search({ description: searchTerm }) }
      else { return Promise.resolve({ list: [], count: 0, firstItemIndex: 0 }); }
   }, [searchTerm])

   const options = ingredientSearchState.status === 'ready' ? ingredientSearchState.data : { list: [], count: 0 };

   function selectIngredient(ingredient: IngredientType) {
      setSearchTerm('');
      setIngredient(ingredient);
   }

   function handleSubmit() {
      if (ingredient.food_id !== 0) {
         setIngredient({ food_id: 0, description: '' })
         onSubmit(ingredient); 
      }
   }

   return (
      <div className='textInput sideButton additionalMargin'>
         <div className='activeSearchBar bottom'>
            <InputText label="Search Ingredient" onChange={ (event) => setSearchTerm(event.target.value) }/>
            <ul className={`${ options.count === 0 ? 'hidden' : '' }`}>
               { options.list.map((ingredient, index) => (
                  <li key={index} onClick={ () => selectIngredient(ingredient) }> { ingredient.commonName ? ingredient.commonName : ingredient.description } </li>
               ))}
            </ul>
         </div>
         <div className='svgButtonContainer'>
            <ButtonIconList iconList={ [{ icon: faCircleCheck, label: 'Add Ingredient to List',  onClick: () => handleSubmit() }] } />
         </div>
      </div>
   )
}