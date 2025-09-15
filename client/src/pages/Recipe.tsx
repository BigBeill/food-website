import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RecipeObject from "../interfaces/RecipeObject";
import axios from "../api/axios";

const database = import.meta.env.VITE_SERVER_LOCATION;

interface RecipeParams {
   recipe?: RecipeObject
}

export default function Recipe({recipe}: RecipeParams) {
   const navigate = useNavigate();

   const { recipeId } = useParams<{ recipeId: string }>();
   const [recipeObject, setRecipeObject] = useState<RecipeObject | null>(null);

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
      axios({ method:'get', url:`/recipe/getObject/${recipeId}` })
      .then((response) => { setRecipeObject(response); })
      .catch((error) => { console.error(error); });
   }, [recipeId, recipe]);

   if ( !recipeObject ) {
      return <p>Error: Recipe ID not found.</p>;
   }

   return (
      <div className="recipeObjectView fullViewPage">
         <h1>{recipeObject.title}</h1>
         <img
            className='consumeSpace'
            src={recipeObject.image?.url ? `${database}${recipeObject.image.url}` : "/recipe-image-fallback.png"} 
            alt='Recipe image'
            loading='lazy'
            onError={(error: React.SyntheticEvent<HTMLImageElement, Event>) => {
               error.currentTarget.onerror = null; // Prevents looping
               error.currentTarget.src = "/recipe-image-fallback.png";
            }}
         />
         <h2>Nutrition</h2>
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

         <h2>Description</h2>
         <p>{recipeObject.description}</p>

         <h2>Ingredients</h2>
         <ul>
            {recipeObject.ingredients.map((ingredient, index) => (
               <li key={index}>
                  {ingredient.label ? ingredient.label : ingredient.portion?.amount + " " + ingredient.portion?.measureDescription + " of [" + ingredient.foodDescription + "]"}
               </li>
            ))}
         </ul>
         <h2>Instructions</h2>
         <ol>
            {recipeObject.instructions.map((instruction, index) => (
               <li key={index}>{instruction}</li>
            ))}
         </ol>
      </div>
   );
}