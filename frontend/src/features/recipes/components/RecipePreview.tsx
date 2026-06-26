import { useRef } from "react";
import { RecipeType } from "../domain/recipes.types";
import GrowingText from "@/shared/components/GrowingText";
import RecipePage from "./RecipePage";
import { useRouter } from "next/router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { unpackImage } from "@/features/images/services/image.services";
import { usePopup } from "../../../shared/hooks/usePopup";

interface RecipePreviewProps {
   recipe: RecipeType;
}

export default function RecipePreview({ recipe }: RecipePreviewProps) {
   const router = useRouter();
   const { userId } = useAuth();
   const popup = usePopup(<RecipePage recipe={recipe}/>);

   const titleRef = useRef<HTMLDivElement>(null);

   return (
      <>
      <div className="recipeObjectView previewPage">
         <div className="titleContainer" ref={titleRef}>
            <GrowingText text={recipe.title} parentDiv={titleRef}/>
         </div>
         <img {...unpackImage({ category: "recipe", image: recipe.image })} />
         <p className="description">{recipe.description}</p>
         <div className="ingredients">
            <p>Ingredients:</p>
            <ul>
               {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                     {ingredient.label ? ingredient.label : ingredient.portion?.amount + " " + ingredient.portion?.measureDescription + " of [" + ingredient.foodDescription + "]"}
                  </li>
               ))}
            </ul>
         </div>
         <div className="nutrition">
            { recipe.nutrition ? 
            <>
               <p>Calories: {recipe.nutrition.calories.toFixed(2)}</p>
               <p>Fat: {recipe.nutrition.fat.toFixed(2)}</p>
               <p>Cholesterol: {recipe.nutrition.cholesterol.toFixed(2)}</p>
               <p>Sodium: {recipe.nutrition.sodium.toFixed(2)}</p>
               <p>Potassium: {recipe.nutrition.potassium.toFixed(2)}</p>
               <p>Carbohydrates: {recipe.nutrition.carbohydrates.toFixed(2)}</p>
               <p>Fibre: {recipe.nutrition.fibre.toFixed(2)}</p>
               <p>Sugar: {recipe.nutrition.sugar.toFixed(2)}</p>
               <p>Protein: {recipe.nutrition.protein.toFixed(2)}</p>
            </>
            : null }
         </div>

         <div className="bottomButtons splitSpace">
            <button onClick={() => popup.show()}> View Recipe </button>
            { recipe.owner == userId ? 
               <button onClick={() => {router.push(`/editRecipe/${recipe._id}`)}}>Edit Recipe</button>
               : null
            }
         </div>
         
      </div>

      {popup.content}
      </>
   );
};