export interface IngredientType {
   food_id: string;
   description: string;
   label?: string;
   commonName?: string;
   portion?: {
      measure_id: string;
      description: string;
      amount: string | null;
   }
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

export interface IngredientConversionType {
   id: string,
   description: string,
   conversionFactorValue: number
}

export interface IngredientGroupType {
   id: string;
   name: string;
}