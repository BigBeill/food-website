import { PackagedImageType } from '@/features/images/domain/image.types';
import { IngredientType } from '../../ingredients/domain/ingredient.types';

export interface RecipeType {
   _id: string;
   owner?: string;
   title: string;
   description: string;
   image?: PackagedImageType;
   ingredientList: IngredientType[];
   instructionList: string[];
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