import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const friendFolderSchema = new Schema(
   {
      ownerId: { type: Schema.Types.ObjectId, required: true },
      parentId: { type: Schema.Types.ObjectId, required: false },
      title: { type: String, required: true },
      folderList: {
         type: [{ type: Schema.Types.ObjectId, ref: 'FriendFolder' }], required: true
      },
      userList: {
         type: [{ type: Schema.Types.ObjectId, ref: 'user' }], required: true,
      }
   },
   { timestamps: true }
);

type FriendFolderSchemaType = InferSchemaType<typeof friendFolderSchema>;
export type FriendFolderDocument = HydratedDocument<FriendFolderSchemaType>;
export type FriendFolderRecord = FriendFolderSchemaType & { 
   _id: Types.ObjectId,
   createdAt: Date;
   updatedAt: Date;
};
export const FriendFolderModel = model('FriendFolder', friendFolderSchema);