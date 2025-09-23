import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "../api/axios";
import GrowingText from "../components/GrowingText";
import Loading from "../components/Loading";
import RecipeObject from "../interfaces/RecipeObject";

const database = import.meta.env.VITE_SERVER_LOCATION;

interface RecipeParams {
   recipe?: RecipeObject
}

export default function Recipe({recipe}: RecipeParams) {

   const titleRef = useRef<HTMLDivElement | null>(null);
   const navigate = useNavigate();

   const { recipeId } = useParams<{ recipeId: string }>();
   const [recipeObject, setRecipeObject] = useState<RecipeObject | null>(null);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      // If recipe is passed as a prop, use it directly
      if (recipe) { 
         setRecipeObject(recipe);
         return;
      }
      // Otherwise, fetch the recipe by ID from the URL
      if (!recipeId){ 
         navigate("/home"); 
         return;
      }
      axios({ method:'get', url:`/recipe/getObject/${recipeId}/true` })
      .then((response) => { setRecipeObject(response); })
      .catch((error) => { 
         console.error(error);
         setError("Failed to load recipe. Please try again later.");
      });
   }, [recipeId, recipe]);

   if (error) {
      return <div className="standardPage">
         <h1>Error</h1>
         <p>{error}</p>
      </div>;
   }
   
   if ( !recipeObject ) {
      return <Loading />;
   }

   return (
      <div className="recipeObjectView fullPage">

         <div className="titleContainer" ref={titleRef} >
            <GrowingText text={recipeObject.title} parentDiv={titleRef} />
         </div>

         <img
            src={recipeObject.image?.url ? `${database}${recipeObject.image.url}` : "/recipe-image-fallback.png"} 
            alt={recipeObject.title ? `${recipeObject.title} image` : 'Recipe image'}
            loading='lazy'
            onError={(error: React.SyntheticEvent<HTMLImageElement, Event>) => {
               error.currentTarget.onerror = null; // Prevents looping
               error.currentTarget.src = "/recipe-image-fallback.png";
            }}
         />

         <div className="description">
            <h3>Description</h3>
            <p>{recipeObject.description}</p>
         </div>

         <div className="ingredients">
            <h3>Ingredients</h3>
            <ul>
               {recipeObject.ingredients.map((ingredient, index) => (
                  <li key={index}>
                     {ingredient.label ? ingredient.label : `${ingredient.portion?.amount} ${ingredient.portion?.measureDescription} of [${ingredient.foodDescription}]`}
                  </li>
               ))}
            </ul>
         </div>

         <div className="nutrition">
            <h3>Nutrition</h3>
            <ul>
               { recipeObject.nutrition ? 
               <>
                  <li>Calories: {recipeObject.nutrition.calories.toFixed(2)}</li>
                  <li>Fat: {recipeObject.nutrition.fat.toFixed(2)}</li>
                  <li>Cholesterol: {recipeObject.nutrition.cholesterol.toFixed(2)}</li>
                  <li>Sodium: {recipeObject.nutrition.sodium.toFixed(2)}</li>
                  <li>Potassium: {recipeObject.nutrition.potassium.toFixed(2)}</li>
                  <li>Carbohydrates: {recipeObject.nutrition.carbohydrates.toFixed(2)}</li>
                  <li>Fibre: {recipeObject.nutrition.fibre.toFixed(2)}</li>
                  <li>Sugar: {recipeObject.nutrition.sugar.toFixed(2)}</li>
                  <li>Protein: {recipeObject.nutrition.protein.toFixed(2)}</li>
               </>
               : null }
            </ul>
         </div>

         <div className="instructions">
            <h3>Instructions</h3>
            <ol>
               {recipeObject.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
               ))}
            </ol>
         </div>
      </div>
   );
}