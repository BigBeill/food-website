import IngredientObject from './IngredientObject'

export default interface RecipeObject {
   _id: string | null;
   title: string;
   description: string;
   image: string;
   ingredients: IngredientObject[];
   instructions: string[];
}