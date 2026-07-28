import { RecipeType } from "../domain/recipes.types";
import { useRef } from "react";
import GrowingText from "@/shared/components/GrowingText";
import Loading from "@/shared/components/stateComponents/LoadingPage";
import NotFound from "@/shared/components/stateComponents/NotFoundPage";
import ImageDisplay from "@/features/images/components/ImageDisplay";
import { recipeService } from "../services/recipes.service";
import useServiceState from "@/shared/hooks/useServiceState";

export default function RecipePage ({ recipeId }: { recipeId: string }) {
   const recipeState = useServiceState(() => recipeService.get(recipeId), [ recipeId ]);

   switch (recipeState.status) {
      case 'loading':
         return <Loading />
      case 'not-found':
         return <NotFound />
      case 'error':
         return <NotFound />
      case 'ready':
         return <RecipeView recipe={recipeState.data}/>
   }
}

export function RecipeView({ recipe }: { recipe: RecipeType }) {
   
   const titleRef = useRef<HTMLDivElement | null>(null);

   return (
      <div className="recipeObjectView fullPage">
      
         <div className="titleContainer" ref={titleRef} >
            <GrowingText text={recipe.title} parentDiv={titleRef} />
         </div>

         <ImageDisplay packagedImage={recipe.image} />

         <div className="description">
            <h3>Description</h3>
            <p>{recipe.description}</p>
         </div>

         <div className="ingredients">
            <h3>Ingredients</h3>
            <ul>
               {recipe.ingredientList.map((ingredient, index) => (
                  <li key={index}>
                     {ingredient.label ? ingredient.label : `${ingredient.portion?.amount} ${ingredient.portion?.description} of [${ingredient.description}]`}
                  </li>
               ))}
            </ul>
         </div>

         <div className="nutrition">
            <h3>Nutrition</h3>
            <ul>
               { recipe.nutrition ? 
               <>
                  <li>Calories: {recipe.nutrition.calories.toFixed(2)}</li>
                  <li>Fat: {recipe.nutrition.fat.toFixed(2)}</li>
                  <li>Cholesterol: {recipe.nutrition.cholesterol.toFixed(2)}</li>
                  <li>Sodium: {recipe.nutrition.sodium.toFixed(2)}</li>
                  <li>Potassium: {recipe.nutrition.potassium.toFixed(2)}</li>
                  <li>Carbohydrates: {recipe.nutrition.carbohydrates.toFixed(2)}</li>
                  <li>Fibre: {recipe.nutrition.fibre.toFixed(2)}</li>
                  <li>Sugar: {recipe.nutrition.sugar.toFixed(2)}</li>
                  <li>Protein: {recipe.nutrition.protein.toFixed(2)}</li>
               </>
               : null }
            </ul>
         </div>

         <div className="instructions">
            <h3>Instructions</h3>
            <ol>
               {recipe.instructionList.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
               ))}
            </ol>
         </div>
      </div>
   );
}