export interface IngredientType {
   food_id: number;
   description: string;
   label?: string;
   commonName?: string;
   portion?: {
      measure_id: number;
      description: string;
      amount: number;
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
   food_id: number,
   measure_id: number,
   description: string,
   value: number
}

export interface IngredientGroupType {
   _id: string;
   name: string;
}