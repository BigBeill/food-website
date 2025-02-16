export default interface IngredientObject {
   foodId: string;
   foodDescription: string;
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
   measureId?: string;
   unit?: string;
   amount?: number | null;
}