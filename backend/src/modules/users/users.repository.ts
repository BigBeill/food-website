import { FriendFolderModel, type FriendFolderRecord } from "../../common/mongo-db/schemas/friendFolder.schema";
import { FriendRequestModel, type FriendRequestRecord } from "../../common/mongo-db/schemas/friendRequest.schema";
import { FriendshipModel, type FriendshipRecord } from "../../common/mongo-db/schemas/friendship.schema";
import { UserModel, type UserRecord } from "../../common/mongo-db/schemas/user.schema";
import type { ImageType } from "../images/images.types";
import type PaginationParams from "../../common/parameters/pagination.parameters";

interface GetFolderListParams extends PaginationParams{
   ownerId: string,
   parentId?: string, 
}

type GetFriendRequestParams = 
   | { _id: string, senderId?: string, receiverId?: string }
   | { _id?: string, senderId: string, receiverId: string }

type GetFriendshipParams = 
   | { _id: string, firstUserId?: string, secondUserId?: string }
   | { _id?: string, firstUserId: string, secondUserId: string }

interface GetUserListParams extends PaginationParams{
   _id?: string,
   name?: string,
}

interface UpdateUserParams {
   _id: string,
   name?: string,
   email?: string,
   bio?: string,
   image?: ImageType
}

export class UsersRepository {

   async createFriendRequest(userId: string, targetId: string): Promise<FriendRequestRecord> {
      const friendRequest = await FriendRequestModel.create({ senderId: userId, receiverId: targetId });
      return friendRequest.toObject();
   }

   async createFriendship(friendIds: [string, string]): Promise<FriendshipRecord> {
      const friendship = await FriendshipModel.create({ friendIds });
      return friendship.toObject();
   }

   async deleteFriendRequest(_id: string) {
      await FriendRequestModel.deleteOne({ _id });
   }

   async deleteFriendship(_id: string) {
      await FriendshipModel.deleteOne({ _id });
   }

   async deleteUser(_id: string): Promise<void> {
      await UserModel.deleteOne({ _id });
   }

   async getExactUserList({name, email}: { name?: string, email?: string }): Promise<UserRecord[]> {
      const conditions: any[] = [];

      if (name) conditions.push({ name });
      if (email) conditions.push({ email });

      if (conditions.length === 0) { return []; }

      const userList = await UserModel.find({ $or: conditions }).lean();
      return userList;
   }

   async getFolderList({ ownerId, parentId, skip, limit }: GetFolderListParams): Promise<{ list: FriendFolderRecord[], count: number }> {
      const resultList = await UserModel.aggregate<{
         FolderList: FriendFolderRecord[];
         countList: { count: number }[];
      }>([
         {
            $match: {
               ownerId, 
               ...(parentId && { parentId }),
            },
         },
         {
            $facet: {
               FolderList: [
                  ...(skip ? [{ $skip: skip }] : []), 
                  ...(limit ? [{ $limit: limit }] : []), 
               ],
               countList: [{ $count: 'count' }],
            }
         }
      ]);

      const result = resultList[0]!;

      return {
         list: result.FolderList,
         count: result.countList[0]?.count ?? 0,
      }
   }

   async getFriendRequest({ _id, senderId, receiverId }: GetFriendRequestParams): Promise<FriendRequestRecord | null> {
      return FriendRequestModel.findOne({ ...(_id && { _id }), ...((senderId && receiverId) && { senderId, receiverId }) }).lean<FriendRequestRecord>();
   }

   async getFriendship({ _id, firstUserId, secondUserId }: GetFriendshipParams): Promise<FriendshipRecord | null> {
      return FriendshipModel.findOne({ 
         ...(_id && { _id }), 
         ...((firstUserId && secondUserId) && { friendIds: { $all: [firstUserId, secondUserId] } }),
      }).lean<FriendshipRecord>();
   }

   async getFriendshipList(userId: string): Promise<FriendshipRecord[]> {
      return FriendshipModel.find({ 
         friendIds: { $in: [ userId ]}, 
      }).lean<FriendshipRecord[]>();
   }

   async getUser(_id: string): Promise<UserRecord | null> {
      const user = UserModel.findOne({_id }).lean<UserRecord>();
      return user;
   }

   async getUserList({ _id, name, skip, limit }: GetUserListParams): Promise<{ list: UserRecord[], count: number }> {
      const resultList = await UserModel.aggregate<{
         UserList: UserRecord[];
         countList: { count: number }[];
      }>([
         {
            $match: {
               ...(_id && { _id }), 
               ...(name && { name }),
            },
         },
         {
            $facet: {
               UserList: [
                  ...(skip ? [{ $skip: skip }] : []), 
                  ...(limit ? [{ $limit: limit }] : []), 
               ],
               countList: [{ $count: 'count' }],
            }
         }
      ]);

      const result = resultList[0]!;

      return {
         list: result.UserList,
         count: result.countList[0]?.count ?? 0,
      }
   }

   async updateUser({ _id, name, email, bio, image }: UpdateUserParams): Promise<UserRecord | null> {
      return UserModel.findByIdAndUpdate(
         _id,
         { $set: { 
            ...(name && { name }), 
            ...(email && { email }), 
            ...(bio !== undefined && { bio }), 
            ...(image && {image}) } 
         },
         { new: true }
      ).lean<UserRecord>()
   }
}