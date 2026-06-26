import type paginationParams from "../../common/parameters/pagination.parameters";
import postgresConnection from "../../config/postgres.database";
import type { IngredientConversionType, IngredientGroupType, IngredientType } from "./ingredients.types";
import { postgresQueryBuilder } from "./ingredients.utils";

interface GetGroupListParams extends paginationParams {
   description?: string,
}

interface GetIngredientList extends paginationParams {
   description?: string,
   food_group_id?: number;
}

export class IngredientsRepository {

   async getBaseNutrition(ingredient_id: number): Promise<{ calories: number, fat: number, cholesterol: number, sodium: number, potassium: number, carbohydrates: number, fibre: number, sugar: number, protein: number }> {
      const { rows } = await postgresQueryBuilder(`SELECT nutrient_id, nutrient_value FROM nutrient_amount`, {
         where: [
            { column: 'food_id', operation: '=', value: ingredient_id.toString() },
            { column: 'nutrient_id', operation: 'IN', value: '(203, 204, 205, 208, 269, 291, 306, 307, 601)' }
         ],
         order: 'nutrient_id',
      });

      // make sure all nutrientRows have been found, if any are missing set them to 0
      if (!rows[0] || rows[0].nutrient_id != 203) { rows.splice(0, 0, { nutrient_id: '203', nutrient_value: '0' } ); }
      if (!rows[1] || rows[1].nutrient_id != 204) rows.splice(1, 0, { nutrient_id: '204', nutrient_value: '0' } );
      if (!rows[2] || rows[2].nutrient_id != 205) rows.splice(2, 0, { nutrient_id: '205', nutrient_value: '0' } );
      if (!rows[3] || rows[3].nutrient_id != 208) rows.splice(3, 0, { nutrient_id: '208', nutrient_value: '0' } );
      if (!rows[4] || rows[4].nutrient_id != 269) rows.splice(4, 0, { nutrient_id: '269', nutrient_value: '0' } );
      if (!rows[5] || rows[5].nutrient_id != 291) rows.splice(5, 0, { nutrient_id: '291', nutrient_value: '0' } );
      if (!rows[6] || rows[6].nutrient_id != 306) rows.splice(6, 0, { nutrient_id: '306', nutrient_value: '0' } );
      if (!rows[7] || rows[7].nutrient_id != 307) rows.splice(7, 0, { nutrient_id: '307', nutrient_value: '0' } );
      if (!rows[8]) rows.splice(8, 0, { nutrient_id: '601', nutrient_value: '0' } );

      return {
         calories: Number(rows[3]),
         fat: Number(rows[1]),
         cholesterol: Number(rows[8]),
         sodium: Number(rows[7]),
         potassium: Number(rows[6]),
         carbohydrates: Number(rows[2]),
         fibre: Number(rows[5]),
         sugar: Number(rows[4]),
         protein: Number(rows[0]),
      }
   }

   async getConversion(food_id: number, measure_id: number): Promise<IngredientConversionType | null> {
      const [ conversionFactorList, measureList ] = await Promise.all([
         postgresConnection.query(
            'SELECT value FROM conversion_factor WHERE food_id = $1 AND measure_id = $2 LIMIT 1',
            [ food_id, measure_id ] 
         ),
         postgresConnection.query(
            'SELECT description FROM measure WHERE _id = $1 LIMIT 1',
            [ measure_id ]
         )
      ]);
      if (!conversionFactorList.rows[0]) { throw new Error('ingredients.repository.getConversion ran into and issue finding conversion_factor with food_id: ' + food_id + ' and measure_id: ' + measure_id); }
      if (!measureList.rows[0]) { throw new Error('ingredients.repository.getConversion ran into an issue finding measure with _id: ' + measure_id); }

      return {
         food_id,
         measure_id,
         description: measureList.rows[0].description,
         value: conversionFactorList.rows[0].value,
      }
   }

   async getConversionList (food_id: number, { skip, limit }: paginationParams ): Promise<IngredientConversionType[]> {
      const { rows } = await postgresQueryBuilder('SELECT food_id, measure_id, value FROM conversion_factor', {
         where: [
            { column: 'food_id', operation: '=', value: food_id.toString() }
         ],
         skip: skip,
         limit: limit,
      });
      const ingredientConversionList = await Promise.all(rows.map(async conversion => {
         const { rows } = await postgresConnection.query(
            'SELECT description FROM measure WHERE _id = $1 LIMIT 1',
            [ conversion.measure_id ]
         );
         if (!rows[0]) { throw new Error('ingredients.repository.getConversionList ran into an issue finding measure with _id: ' + conversion.measure_id); }
         return {
            food_id: conversion.food_id,
            measure_id: conversion.measure_id,
            description: rows[0].description,
            value: conversion.value,
         }
      }));
      return ingredientConversionList;
   }

   async getGroupList ({ description, skip, limit }: GetGroupListParams): Promise<IngredientGroupType[]> {
      // TODO: I feel like there is a cleaner way to do this but i just need this to work for now
      const { rows } = await postgresQueryBuilder<IngredientGroupType>('SELECT * FROM food_group', {
         where: [
            description && { column: 'description', operation: 'ILIKE', value: `%${description}%` },
         ].filter(Boolean) as { column: string; operation: string; value: string; }[],
         skip,
         limit,
      });
      return rows;
   }

   async getIngredient (_id: number): Promise<IngredientType | null> {
      const { rows } = await postgresConnection.query(
         'SELECT _id, description FROM food WHERE id = $1 LIMIT 1',
         [ _id ]
      );
      return rows[0] ?? null;
   }

   async getIngredientList ({ description, food_group_id, skip, limit }: GetIngredientList): Promise<IngredientType[]> {
      const { rows } = await postgresQueryBuilder<IngredientType>('SELECT * FROM food', { 
         where: [
            description && { column: 'description', operation: 'ILIKE', value: `%${description}%` },
            food_group_id && { column: 'food_group_id', operation: '=', value: `${food_group_id}` }
         ].filter(Boolean) as { column: string; operation: string; value: string; }[],
         skip: skip,
         limit: limit,
      });
      return rows;
   }
}