import { PackagedImageType } from '@/features/images/domain/image.types';
import { IngredientType } from '../../ingredients/domain/ingredient.types';

export interface RecipeDraft {
   ownerId: string;
   title: string;
   description: string;
   image?: File;
   ingredientList: IngredientType[];
   instructionList: string[];
   visibility: 'public' | 'private' | 'personal';
}

export interface RecipeType{
   _id: string;
   ownerId: string;
   title: string;
   description: string;
   image?: PackagedImageType;
   ingredientList: IngredientType[];
   instructionList: string[];
   visibility: 'public' | 'private' | 'personal';
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