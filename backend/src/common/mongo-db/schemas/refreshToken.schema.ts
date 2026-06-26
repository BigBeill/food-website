import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const refreshTokenSchema = new Schema(
   {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      hash: { type: String, required: true, unique: true },
   },
   { timestamps: true },
);

// TTL index — Mongo deletes docs ~30 days after createdAt
refreshTokenSchema.index(
   { createdAt: 1 },
   { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

refreshTokenSchema.index({ user: 1 });

type RefreshTokenSchemaType = InferSchemaType<typeof refreshTokenSchema>;
export type RefreshTokenDocument = HydratedDocument<RefreshTokenSchemaType>;
export type RefreshTokenRecord = RefreshTokenSchemaType & { 
   _id: Types.ObjectId,
   createdAt: Date;
   updatedAt: Date;
};
export const RefreshTokenModel = model('RefreshToken', refreshTokenSchema);