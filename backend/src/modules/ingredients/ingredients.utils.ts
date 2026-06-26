import type { QueryResult, QueryResultRow } from "pg";
import postgresConnection from "../../config/postgres.database";
import type { IngredientType } from "./ingredients.types";

interface BuildPostgresQueryParams {
   where?: {
      column: string,
      operation: string,
      value: string,
   }[],
   skip?: number,
   limit?: number,
   order?: string,
}

export async function postgresQueryBuilder<T extends QueryResultRow>(baseQuery: string, functionParams: BuildPostgresQueryParams = {}): Promise<QueryResult<T>>{
   const { where = [], skip, limit, order } = functionParams;

   const params = [];
   const conditions = [];

   for (const { column, operation, value } of where) {
      params.push(value);
      conditions.push(`${column} ${operation} $${params.length}`);
   }

   const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
   let query = `${baseQuery} ${whereClause}`;

   if (limit) { 
      params.push(limit)
      query += ` LIMIT $${params.length}`
   }
   if (skip) { 
      params.push(skip)
      query += ` OFFSET $${params.length}`
   }
   if (order) {
      params.push(order)
      query += ` ORDER BY $${params.length}`
   }

   return postgresConnection.query<T>(query, params);
}

export function breakupMeasureDescription(measureDescription: string ): { number: number, string: string} {
   let numberAsString = "";
   let denominator = "";
   let slashFound = false;
   let unitStart = 0;

   // go through each number in the string until a character is found
   for (let i = 0; i < measureDescription.length; i++) {
      if (/[\d.]/.test(measureDescription[i]!)) {
         if(!slashFound) numberAsString += measureDescription[i];
         else denominator += measureDescription[i];
      } 
      else if (measureDescription[i] == "/") slashFound = true;
      else{
         if (measureDescription[i] == " ") unitStart = i + 1;
         else unitStart = i;
         break;
      }
   }

   const number = Number(numberAsString) / (Number(denominator) || 1);

   const string =  measureDescription.slice(unitStart);

   return { number, string }
}

type StoredIngredient = Pick<IngredientType, 'food_id' | 'label'> & {
   portion: Pick<IngredientType['portion'], 'measure_id' | 'amount'>;
};

export function toStoredIngredient(ingredient: IngredientType): StoredIngredient {
   return {
      food_id: ingredient.food_id,
      label: ingredient.label,
      portion: {
         measure_id: ingredient.portion.measure_id,
         amount: ingredient.portion.amount,
      },
   };
}