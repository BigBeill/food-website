type MongooseNoise = '__v' | 'createdAt' | 'updatedAt';
type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
   return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function removeFromList(list: unknown[]): unknown[] {
   return list.map((item) => removeMongooseNoise(item));
}

function removeFromObject(obj: PlainObject): PlainObject {
   const { __v, createdAt, updatedAt, ...rest } = obj as Partial<Record<MongooseNoise, unknown>> & PlainObject;
   if (__v || createdAt || updatedAt) {
      console.warn( `[removeMongooseNoise] Stripped metadata field(s) from outgoing data. If this was intentional, wrap the value in a 'clientSafeMetadata' field instead.`);
   }
   return Object.fromEntries(
      Object.entries(rest).map(([key, value]) => { 
         if(key != "clientSafeMetadata") { return [key, removeMongooseNoise(value)] }
         else { return [key, value]}
      })
   );
}

export function removeMongooseNoise(value: unknown): unknown {
   if (Array.isArray(value)) { return removeFromList(value); }
   if (isPlainObject(value)) { return removeFromObject(value); }
   return value;
}