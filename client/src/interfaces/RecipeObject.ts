import ImageObject from './ImageObject'
import IngredientObject from './IngredientObject'

export default interface RecipeObject {
   _id: string;
   owner?: string;
   title: string;
   description: string;
   image?: ImageObject;
   ingredients: IngredientObject[];
   instructions: string[];
   nutrition?: {
      calories: number;
      fat: number;
      cholesterol: number;
      sodium: number;
      potassium: number;
      carbohydrates: number;
      fibre: number;
      sugar: number;
      protein: number;
   }
   visibility: 'public' | 'private' | 'personal';
}