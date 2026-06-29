import type { IngredientRecord } from "../../common/mongo-db/schemas/recipe.schema";
import type PaginationParams from "../../common/parameters/pagination.parameters";
import type { NutritionType } from "../recipes/recipes.types";
import type { IngredientsRepository } from "./ingredients.repository";
import type { IngredientConversionType, IngredientGroupType, IngredientType } from "./ingredients.types";
import { breakupMeasureDescription } from "./ingredients.utils";

interface SearchGroupParams extends PaginationParams {
   description?: string,
}

interface SearchIngredientParams extends PaginationParams {
   description?: string;
   food_group_id?: number;
}

export class IngredientsService {
   private readonly repository: IngredientsRepository;

   constructor(ingredientsRepository: IngredientsRepository) {
      this.repository = ingredientsRepository;
   }

   async getIngredient (_id: number): Promise<IngredientType | null> {
      const ingredient = await this.repository.getIngredient(_id);
      return ingredient;
   }

   async getNutrition (ingredientList: IngredientType[]): Promise<NutritionType> {

      // get a list of nutrients found in each ingredient
      const nutritionList: NutritionType[] = await Promise.all( ingredientList.map(async (ingredient) => {
         const [ nutrition, conversion ] = await Promise.all([
            this.repository.getBaseNutrition(ingredient.food_id),
            this.repository.getConversion(ingredient.food_id, ingredient.portion!.measure_id),
         ]);

         const { number: measureNumber } = conversion ? breakupMeasureDescription(conversion.description): { number: 1 };
         
         const totalConversion = ((conversion?.value || 1) / measureNumber) * ingredient.portion!.amount;

         const scaledNutrition = Object.fromEntries(
            Object.entries(nutrition).map(([field, value]) => [field, value * totalConversion]),
         ) as typeof nutrition;

         return scaledNutrition;
      }));

      // add all nutrition values together
      const totalNutrition = nutritionList.reduce((acc, nutrition) => {
         for (const key of Object.keys(acc) as (keyof typeof acc)[]) {
            acc[key] += nutrition[key];
         }
         return acc;
      }, { calories: 0, fat: 0, cholesterol: 0, sodium: 0, potassium: 0, carbohydrates: 0, fibre: 0, sugar: 0, protein: 0 });
   
      return totalNutrition;
   }

   async hydrateIngredient(record: IngredientRecord): Promise<IngredientType> {
      const [ ingredient, conversion ] = await Promise.all([
         this.repository.getIngredient(record.food_id),
         this.repository.getConversion(record.food_id, record.portion.measure_id),
      ]);
      return {
         ...record,
         description: ingredient?.description || "",
         portion: {
            ...record.portion,
            description: conversion?.description || "",
         }
      }
   }

   // TODO: get repository to return count so paginated list can be used effectively
   async searchConversion (food_id: number, params: PaginationParams): Promise<IngredientConversionType[]> {
      const { skip, limit } = params;
      const conversionList = await this.repository.getConversionList(food_id, { skip, limit });
      return conversionList;
   }

   async searchGroup (params: SearchGroupParams): Promise<IngredientGroupType[]> {
      const { description, skip, limit } = params;
      const groupList = await this.repository.getGroupList({ description, skip, limit });
      return groupList;
   }

   async searchIngredient (params: SearchIngredientParams): Promise<IngredientType[]> {
      const { description, food_group_id, skip, limit } = params;
      const ingredientList = await this.repository.getIngredientList({ description, food_group_id, skip, limit });
      return ingredientList;
   }
}