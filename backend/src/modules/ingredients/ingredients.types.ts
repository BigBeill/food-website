export interface IngredientType {
   food_id: number;
   description: string;
   label?: string;
   commonName?: string;
   portion: {
      measure_id: number;
      description: string;
      amount: number;
   }
}

export interface IngredientConversionType {
   food_id: number
   measure_id: number,
   description: string,
   value: number
}

export interface IngredientGroupType {
   id: string;
   name: string;
}