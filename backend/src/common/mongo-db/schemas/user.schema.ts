import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { ImageSchema } from './image.schema';

const userSchema = new Schema(
   {
      name: { type: String, required: true, unique:true },
      email: { type: String, required: true, unique:true },
      bio: String,
      image: { type: ImageSchema, default: null },
      passwordHash: {type: String, select: false},
   },
   { timestamps: true }
);

type UserSchemaType = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserSchemaType>;
export type UserRecord = UserSchemaType & { 
   _id: Types.ObjectId,
   createdAt: Date;
   updatedAt: Date;
};
export const UserModel = model('User', userSchema);