import { useState } from "react";
import { IngredientType } from "../domain/ingredient.types";
import useServiceState from "@/shared/hooks/useServiceState";
import { ingredientService } from "../services/ingredient.service";
import LoadingPage from "@/shared/components/stateComponents/LoadingPage";
import NotFoundPage from "@/shared/components/stateComponents/NotFoundPage";
import ErrorPage from "@/shared/components/stateComponents/ErrorPage";


export default function IngredientPage({ ingredientId }: { ingredientId: number }) {
   const ingredient = useServiceState(() => { return ingredientService.get(ingredientId) }, [ingredientId]);

   switch (ingredient.status) {
      case 'loading':
         return <LoadingPage />
      case 'not-found':
         return <NotFoundPage />
      case 'error':
         return <ErrorPage />
      case 'ready':
         return <IngredientView ingredient={ ingredient.data } />
   }
}

function IngredientView({ ingredient }: { ingredient: IngredientType }) {

   const [quantity, setQuantity] = useState<{value: number, unit: string}>({value: 100, unit: 'g'});

   return (
      <div className="standardPage">
         <h1>{ingredient.description}</h1>
         <input type='number' value={quantity.value} onChange={(event) => setQuantity({...quantity, value: Number(event.target.value)})}/>
         <p>calories: {((ingredient.nutrition!.calories/100) * quantity.value).toFixed(0)}</p>
         <p>fat: {((ingredient.nutrition!.fat/100) * quantity.value).toFixed(2)}g</p>
         <p>cholesterol: {((ingredient.nutrition!.cholesterol/100) * quantity.value).toFixed(0)}mg</p>
         <p>sodium: {((ingredient.nutrition!.sodium/100) * quantity.value).toFixed(0)}mg</p>
         <p>potassium: {((ingredient.nutrition!.potassium/100) * quantity.value).toFixed(0)}mg</p>
         <p>carbohydrates: {((ingredient.nutrition!.carbohydrates/100) * quantity.value).toFixed(2)}g</p>
         <p>fibre: {((ingredient.nutrition!.fibre/100) * quantity.value).toFixed(1)}g</p>
         <p>sugar: {((ingredient.nutrition!.sugar/100) * quantity.value).toFixed(2)}g</p>
         <p>protein: {((ingredient.nutrition!.protein/100) * quantity.value).toFixed(2)}g</p>
      </div>
   );
}