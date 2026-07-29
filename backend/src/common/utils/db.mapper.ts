import { Types } from 'mongoose';

type MongooseNoise = '__v' | 'createdAt' | 'updatedAt';
type PlainObject = Record<string, unknown>;
type SerializedBuffer = { type: 'Buffer'; data: number[] };

function isPlainObject(value: unknown): value is PlainObject {
   return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isObjectId(value: unknown): value is Types.ObjectId {
   if (value instanceof Types.ObjectId) return true;
   // duck-type fallback: pnpm can end up with >1 bson copy, breaking instanceof
   const tag = (value as { _bsontype?: string } | null)?._bsontype;
   return tag === 'ObjectId' || tag === 'ObjectID'; // casing changed across bson versions
}

// The shape an ObjectId/Buffer degrades to after JSON: { type: 'Buffer', data: number[] }
function isSerializedBuffer(value: unknown): value is SerializedBuffer {
   return isPlainObject(value) && value.type === 'Buffer' && Array.isArray(value.data);
}

function toHexString(value: unknown): string {
   if (Buffer.isBuffer(value)) return value.toString('hex');
   if (isObjectId(value)) return value.toString();          // already hex
   return Buffer.from((value as SerializedBuffer).data).toString('hex');
}

function removeFromList(list: unknown[]): unknown[] {
   return list.map((item) => removeMongooseNoise(item));
}

function removeFromObject(obj: PlainObject): PlainObject {
   const { __v, createdAt, updatedAt, ...rest } = obj as Partial<Record<MongooseNoise, unknown>> & PlainObject;
   if ('__v' in obj || 'createdAt' in obj || 'updatedAt' in obj) {
      console.warn(`[removeMongooseNoise] Stripped metadata field(s) from outgoing data. If this was intentional, wrap the value in a 'clientSafeMetadata' field instead.`);
   }
   return Object.fromEntries(
      Object.entries(rest).map(([key, value]) => {
         if (key != 'clientSafeMetadata') { return [key, removeMongooseNoise(value)]; }
         else { return [key, value]; }
      })
   );
}

export function removeMongooseNoise<T>(value: unknown): T {
   if (Buffer.isBuffer(value) || isObjectId(value) || isSerializedBuffer(value)) {
      return toHexString(value) as T;
   }
   if (Array.isArray(value)) { return removeFromList(value) as T; }
   if (isPlainObject(value)) { return removeFromObject(value) as T; }
   return value as T;
}