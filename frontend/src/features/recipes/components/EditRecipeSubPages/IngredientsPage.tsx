import { IngredientConversionType, IngredientType } from "@/features/ingredients/domain/ingredient.types";
import { ingredientService } from "@/features/ingredients/services/ingredient.service";
import { ButtonOval } from "@/shared/components/Button.components";
import { InputSearch } from "@/shared/components/Input.components";
import { useIntractableList } from "@/shared/hooks/useIntractableList";
import useServiceState from "@/shared/hooks/useServiceState";
import { DataHandle } from "@/shared/shared.types";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ref, useImperativeHandle, useState } from "react";

// just ingredient type but portion is forced
type NewIngredientType = Omit<IngredientType, 'portion'> & {
  portion: NonNullable<IngredientType['portion']>;
};

interface EditRecipeIngredientsPageProps {
   ref: Ref<DataHandle<IngredientType[]>>
   initial?: IngredientType[];
}


export default function EditRecipeIngredientsPage ({ ref, initial}: EditRecipeIngredientsPageProps) {

   const ingredientList = useIntractableList({ 
      initial,
      renderItemContent: (item: IngredientType) => {
         if (item.commonName) { return (<p>{ item.commonName }</p>) }
         else if (item.portion) { return (<p>{ item.portion.amount } { item.portion.description } of [{ item.description }]</p>)  }
         else { return (<p>[{ item.description }]</p>) }
      },
      renderItemOptions: (item: IngredientType, index: number) => (
         <FontAwesomeIcon
            role='button'
            tabIndex={0}
            aria-label={`Remove ingredient ${index + 1}`}
            icon={faCircleXmark}
            style={{color: "#575757",}}
            onClick={() => ingredientList.removeIndex(index)} 
         />
      ), 
   });

   // function that lets the parent component read and write to ingredientList
   useImperativeHandle(ref, () => ({
      getData: ingredientList.content,
      setData: ingredientList.replaceList,
   }), [ingredientList])

   const [newIngredient, setNewIngredient] = useState<NewIngredientType>({ food_id: 0, description: '', label: '', commonName: '', portion: { measure_id: 0, description: '', amount: 0 } });

   const conversionListState = useServiceState<IngredientConversionType[]>(() => { 
      if (newIngredient.food_id !== 0) { return ingredientService.conversionOptionList(newIngredient.food_id); }
      else { return Promise.resolve([{ food_id: 0, measure_id: 1489, description: 'g', value: 1 }]); }
   }, [newIngredient.food_id])

   function addIngredient() {
      ingredientList.addItem(newIngredient);
      setNewIngredient({ food_id: 0, description: '', label: '', commonName: '', portion: { measure_id: 0, description: '', amount: 0 } })
   }

   return (
      <div className='consumeSpace'>
         <h2>Recipe Ingredients</h2>
         
         { ingredientList.reactComponent }

         <div>
            <input type='text' placeholder='Ingredient Label (optional)' value={newIngredient.label} onChange={(event) => setNewIngredient({...newIngredient, label: event.target.value})}/>
            <input 
               type='number'  
               placeholder='Amount' 
               value={newIngredient.portion!.amount} 
               onChange={ (event) => setNewIngredient((previous) => ({ ...previous, portion: { ...previous.portion, amount: Number(event.target.value) } })) }
            />
            <select 
               value={newIngredient.portion?.description} 
               onChange={ (event) => setNewIngredient((previous) => ({ ...previous, portion: { ...previous.portion, measure_id: Number(event.target.options[event.target.selectedIndex].id), description: event.target.value } })) } 
            >
               <option value="" disabled hidden className='light'>Units</option>
               { conversionListState.status === 'ready' && conversionListState.data.map((conversionFactor, index) => (
                  <option key={index} id={ String(conversionFactor.measure_id) }>{conversionFactor.description}</option>
               )) }
            </select>
         </div>

         <InputSearch 
            label="Ingredient"
            placeholder="Add New Ingredient"
            buttonAction={ (item: IngredientType) => { ingredientList.addItem(item); } }
            fetcher={ (value: string) => { return ingredientService.search({ description: value }) } }
            renderListItem={ (item: IngredientType) => ( <p>{item.description}</p> ) }
            onItemSelect={ (item: IngredientType) => { setNewIngredient({ ...item, portion: { measure_id: 0, description: '', amount: 0 } }) } }
         />

         <ButtonOval onClick={ () => addIngredient } >
            Add Ingredient
         </ButtonOval>

         <button className="darkText additionalMargin" onClick={() => addIngredient()}>Add Ingredient</button>

      </div>
   )
}
