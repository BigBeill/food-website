import { Types } from 'mongoose';

type MongooseNoise = '__v' | 'createdAt' | 'updatedAt';
type PlainObject = Record<string, unknown>;
type SerializedBuffer = { type: 'Buffer'; data: number[] };

function isPlainObject(value: unknown): value is PlainObject {
   if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
   const prototype = Object.getPrototypeOf(value);
   return prototype === Object.prototype || prototype === null;
}

function isObjectId(value: unknown): value is Types.ObjectId {
   if (value instanceof Types.ObjectId) return true;
   // duck-type fallback: pnpm can end up with >1 bson copy, breaking instanceof
   const tag = (value as { _bsontype?: string } | null)?._bsontype;
   return tag === 'ObjectId' || tag === 'ObjectID'; // casing changed across bson versions
}

function isSerializedBuffer(value: unknown): value is SerializedBuffer {
   return isPlainObject(value) && value.type === 'Buffer' && Array.isArray(value.data);
}

function isHydratedDocument(value: unknown): value is { toObject: () => PlainObject } {
   return typeof (value as { toObject?: unknown } | null)?.toObject === 'function';
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
   return Object.fromEntries(
      Object.entries(rest).map(([key, value]) => {
         if (key !== 'clientSafeMetadata') { return [key, removeMongooseNoise(value)]; }
         else { return [key, value]; }
      })
   );
}

export function removeMongooseNoise<T>(value: unknown): T {
   if (Buffer.isBuffer(value) || isObjectId(value) || isSerializedBuffer(value)) {
      return toHexString(value) as T;
   }
   if (value instanceof Date) { return value.toISOString() as T; }
   if (value instanceof Map) { return removeMongooseNoise(Object.fromEntries(value)) as T; }
   if (Array.isArray(value)) { return removeFromList(value) as T; }
   if (isHydratedDocument(value)) { return removeFromObject(value.toObject()) as T; }
   if (isPlainObject(value)) { return removeFromObject(value) as T; }
   return value as T;
}