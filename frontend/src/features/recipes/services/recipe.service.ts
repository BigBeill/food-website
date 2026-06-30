import { useEffect, useRef, useState } from "react";
import { RecipeType } from "../domain/recipes.types";
import { recipeApi } from "./recipes.api";

type RecipeInput = RecipeType | Promise<RecipeType> | string;

type RecipeState =
   | { status: 'loading' }
   | { status: 'ready'; recipe: RecipeType }
   | { status: 'not-found' }
   | { status: 'error'; error: unknown };

export function useRecipe(input: RecipeInput): RecipeState {
   const [state, setState] = useState<RecipeState>({ status: 'loading' });

   // lets effects bail out if a newer input arrives before this one resolves
   const requestIdRef = useRef(0);

   useEffect(() => {
      const requestId = ++requestIdRef.current;
      setState({ status: 'loading' });

      const resolve = async () => {
         try {
            let recipe: RecipeType | null;

            if (typeof input === 'string') { recipe = await recipeApi.get(input, { includeNutrients: true }); } 
            else if (input instanceof Promise) { recipe = await input; }
            else { recipe = input; }

            if (requestIdRef.current !== requestId) return; // stale, a newer input superseded this one

            setState(recipe ? { status: 'ready', recipe } : { status: 'not-found' });
         }
         catch (error) {
            if (requestIdRef.current !== requestId) return;
            setState({ status: 'error', error });
         }
      };

      resolve();
   }, [input]);

   return state;
}