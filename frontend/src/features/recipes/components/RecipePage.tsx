import { unpackImage } from "@/features/images/services/image.services";
import { RecipeType } from "../domain/recipes.types";
import { useEffect, useRef, useState } from "react";
import GrowingText from "@/shared/components/GrowingText";
import { recipeService } from "../services/recipes.service";
import { useRouter } from "next/router";

interface RecipePageInterface {
   recipeId?: string;
   initialRecipe?: RecipeType;
}
export default function RecipePage({ initialRecipe, recipeId }: RecipePageInterface) {

   const router = useRouter();

   const [recipe, setRecipe] = useState<RecipeType>({_id: '', title:  '', description: '', ingredientList: [], instructionList: [], visibility: 'public'});
   const titleRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      if (initialRecipe) {
         setRecipe(initialRecipe);
      }
      else if (recipeId) {
         recipeService.get(recipeId, { includeNutrients: true })
         .then((response) => {
            setRecipe(response);
         })
         .catch((error) => console.error(error));
      }
      else {
         router.replace('/searchRecipe')
      }

   }, [initialRecipe, recipeId])

   return (
      <div className="recipeObjectView fullPage">
      
         <div className="titleContainer" ref={titleRef} >
            <GrowingText text={recipe.title} parentDiv={titleRef} />
         </div>

         <img {...unpackImage({ category: "recipe", image: recipe.image })} />

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