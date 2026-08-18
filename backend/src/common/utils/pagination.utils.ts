import type { PaginatedListType } from "../types/return.types";


type MongooseResponseType<T> = Array<{
   recordList: T[];
   countList: { count: number }[];
}>

export function mongooseAggregateToPaginatedList<T> ( mongooseResponse: MongooseResponseType<T>, skip?: number, limit?: number): PaginatedListType<T> {
   const result = mongooseResponse[0]!;
   const count = result.countList[0]?.count ?? 0;

   return {
      list: result.recordList,
      count,
      groupNumber: Math.ceil((skip ?? 0) / ((limit ?? count) || 1)),
      groupSize: limit ?? count,
   }
}