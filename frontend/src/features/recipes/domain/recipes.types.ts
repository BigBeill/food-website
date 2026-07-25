import { PackagedImageType } from '@/features/images/domain/image.types';
import { IngredientType } from '../../ingredients/domain/ingredient.types';

export interface RecipeDraft {
   ownerId: string;
   title: string;
   description: string;
   ingredientList: IngredientType[];
   instructionList: string[];
   visibility: 'public' | 'private' | 'personal';
}

export interface RecipeType extends RecipeDraft {
   _id: string;
   image?: PackagedImageType;
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
}