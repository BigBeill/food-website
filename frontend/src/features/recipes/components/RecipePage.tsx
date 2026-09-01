"use client"

import { RecipeType } from "../domain/recipes.types";
import GrowingText from "@/shared/components/GrowingText";
import ImageDisplay from "@/features/images/components/ImageDisplay";
import { ComponentPropsWithoutRef, useState } from "react";
import Notebook, { NotebookPage } from "@/shared/components/Notebook";
import { Fullscreen } from "@/shared/components/Fullscreen";

interface Props {
   recipe: RecipeType;
}

export default function RecipePage ({ recipe }: Props) {
   const [fullscreen, setFullscreen] = useState(false);

   return (
      <>
         <Notebook components={ { list: [<TitlePage recipe={ recipe }/>, <InstructionPage recipe={ recipe } onClick={ () => setFullscreen(true) } />], count: 2, firstItemIndex: 0 } }/>

         <Fullscreen condition={ fullscreen } onExit={ () => setFullscreen(false) } >
            <h1>{ recipe.title }</h1>
            <ul>
               { recipe.ingredientList.map((ingredient, index) => (
                  <li key={ index }>{ ingredient.portion?.amount } { ingredient.portion?.description} of { ingredient.description }</li>
               )) }
            </ul>
            <h3>Instructions</h3>
            <ol>
               { recipe.instructionList.map((instruction, index) => (
                  <li key={ index }>
                     <h4>Step { index + 1}</h4>
                     <p>{ instruction }</p>
                  </li>
               ))}
            </ol>
         </Fullscreen>
      </>
   )
}

function TitlePage({ recipe }: Props) {
   return (
      <NotebookPage>
         <div className="recipeObjectView fullPage">
            <GrowingText text={recipe.title}/>

            <ImageDisplay packagedImage={recipe.image} />

            <div className="description">
               <h3>Description</h3>
               <p>{recipe.description}</p>
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
         </div>
      );

      </NotebookPage>
   );
}

function InstructionPage({ recipe, ...rest }: Props & ComponentPropsWithoutRef<'div'>) {

   return (
      <NotebookPage { ...rest }>
         <h2>How To Make</h2>
         <h3>Ingredients</h3>
         <ul>
            { recipe.ingredientList.map((ingredient, index) => (
               <li key={ index }>{ ingredient.portion?.amount } { ingredient.portion?.description} of { ingredient.description }</li>
            )) }
         </ul>
         <h3>Instructions</h3>
         <ol>
            { recipe.instructionList.map((instruction, index) => (
               <li key={ index }>
                  <h4>Step { index + 1}</h4>
                  <p>{ instruction }</p>
               </li>
            )) }
         </ol>
      </NotebookPage>
   )
}