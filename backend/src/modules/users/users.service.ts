import { ConflictError, NotFoundError, UnauthorizedError } from "../../common/errors/app-error";
import type { FriendRequestRecord } from "../../common/mongo-db/schemas/friendRequest.schema";
import type { FriendshipRecord } from "../../common/mongo-db/schemas/friendship.schema";
import type { UserRecord } from "../../common/mongo-db/schemas/user.schema";
import type AuthIdParams from "../../common/parameters/authId.parameters";
import type PaginationParams from "../../common/parameters/pagination.parameters";
import type { PaginatedListType } from "../../common/types/PaginatedList.type";
import { removeMongooseNoise } from "../../common/utils/db.mapper";
import type { AuthService } from "../auth/auth.service";
import type { ImagesService } from "../images/images.service";
import type { ImageType } from "../images/images.types";
import type { RecipesService } from "../recipes/recipes.service";
import { UsersRepository } from "./users.repository";
import type { FriendFolderType, UserType, RelationshipType } from "./users.types";
import { buildConflictString } from "./users.utils";

interface GetUserParams extends AuthIdParams{
   includeRelationship?: boolean,
}

interface SearchFoldersParams extends PaginationParams {
   authId: string,
   parentId?: string,
}

interface SearchUsersParams extends PaginationParams {
   authId?: string,
   _id?: string,
   name?: string,
   includeRelationship?: boolean,
}

interface UpdateAccountParams {
   authId: string,
   name?: string,
   email?: string,
   bio?: string,
   image?: ImageType,
}

export class UsersService {
   private readonly repository: UsersRepository;
   private readonly authService: AuthService;
   private readonly recipesService: RecipesService;
   private readonly imagesService: ImagesService;

   constructor(usersRepository: UsersRepository, authService: AuthService, recipesService: RecipesService, imagesService: ImagesService) {
      this.repository = usersRepository;
      this.authService = authService;
      this.recipesService = recipesService;
      this.imagesService = imagesService;
   }

   async defineRelationship(authId: string, userId: string): Promise<RelationshipType> {
      const definingRelationship = { ownerId: userId, targetId: authId }

      if (definingRelationship.ownerId = definingRelationship.targetId) { 
         return { _id: "0", type: "self", ...definingRelationship }
      }

      let relationship: FriendshipRecord | FriendRequestRecord | null;
      relationship = await this.repository.getFriendship({ firstUserId: definingRelationship.ownerId, secondUserId: definingRelationship.targetId });
      if (relationship) {
         return { _id: relationship._id.toString(), type: "friend", ...definingRelationship };
      }
      relationship = await this.repository.getFriendRequest({ senderId: definingRelationship.ownerId, receiverId: definingRelationship.targetId });
      if (relationship) {
         return { _id: relationship._id.toString(), type: "requestSent", ...definingRelationship };
      }
      relationship = await this.repository.getFriendRequest({ senderId: definingRelationship.targetId, receiverId: definingRelationship.ownerId });
      if (relationship) {
         return { _id: relationship._id.toString(), type: "requestReceived", ...definingRelationship }
      }

      //? relationship must not exist if nothing has been returned
      return { _id: "0", type: "none", ...definingRelationship };
   }

   async deleteAccount(password: string, params: AuthIdParams): Promise<boolean> {
      const { authId } = params;
      if (!authId) { throw new UnauthorizedError(); }

      // make sure the client know the password of the signed in account
      const validPassword = await this.authService.verifyPassword(authId, password);
      if (!validPassword) { throw new UnauthorizedError('Invalid Credentials'); }

      // delete any recipes associated with the account
      await this.recipesService.deleteManyRecipes(authId);

      // delete users avatar image
      const user = await this.repository.getUser(authId);
      if (user?.image) {
         await this.imagesService.deleteImage('avatars', user.image.filename)
      }

      await this.repository.deleteUser(authId);
      return true;
   }

   async deleteFriendship(_id: string, params: AuthIdParams): Promise<boolean> {
      const { authId } = params;
      if (!authId) { throw new UnauthorizedError(); }

      const friendship = await this.repository.getFriendship({ _id });
      if (!friendship || !friendship.friendIds.some(_id => _id.toString() === authId)) { throw new UnauthorizedError('Invalid Credentials'); }

      await this.repository.deleteFriendship(_id);
      return true;
   }

   async getFriendIdList(userId: string) {
      const friendshipList = await this.repository.getFriendshipList(userId);
      
      // filter out the userId from each friendship and return an array of Ids
      return friendshipList.map((friendship) => {
         const firstFriendId = friendship.friendIds[0]!.toString();
         if (firstFriendId !== userId) { return firstFriendId; }
         else { return friendship.friendIds[1]!.toString(); }
      });
   }

   async getUser(_id: string, params: GetUserParams): Promise<UserRecord | null> {
      const { authId, includeRelationship } = params;
      const user = this.repository.getUser(_id);
      return user;
   }

   async searchFolders(params: SearchFoldersParams): Promise<PaginatedListType<FriendFolderType>> {
      const { authId, parentId, skip, limit, } = params;
      const folders = await this.repository.getFolderList({ ownerId: authId, skip, limit, ...(parentId && { parentId }) });
      return removeMongooseNoise(folders) as PaginatedListType<FriendFolderType>
   }

   async searchUsers(params: SearchUsersParams): Promise<PaginatedListType<UserType>> {
      const { authId, _id, name, skip, limit, includeRelationship } = params;
      const userRecords = await this.repository.getUserList({ _id, name, skip, limit });
      let users = removeMongooseNoise(userRecords.list) as PaginatedListType<UserType>;
      if (includeRelationship) {
         if (!authId) { throw new UnauthorizedError('Include relationship flag cannot be set to true if user is not signed in'); }
         users.list.map((user) => {
            const relationship = this.defineRelationship(authId, user._id);
            return { ...user, relationship };
         });
      }

      return users;
   }

   async sendFriendRequest(targetId: string, params: AuthIdParams): Promise<RelationshipType> {
      const { authId } = params;
      if(!authId) { throw new UnauthorizedError(); }

      const friendRequest = await this.repository.createFriendRequest(authId, targetId)
      return {
         _id: friendRequest._id.toString(),
         ownerId: targetId,
         targetId: authId,
         type: 'requestReceived',
      }
   }

   async processFriendRequest(_id: string, response: boolean, params: AuthIdParams): Promise<RelationshipType> {
      const { authId } = params;
      if(!authId) { throw new UnauthorizedError(); }

      // get friendship from the database
      const friendRequest = await this.repository.getFriendRequest({ _id });
      if (!friendRequest) { throw new NotFoundError("Friend request not found"); }

      // check if friendship can be approved
      if (response && friendRequest.receiverId.toString() === authId) {
         await this.repository.deleteFriendRequest(_id);
         const friendship = await this.repository.createFriendship([ friendRequest.senderId.toString(), friendRequest.receiverId.toString() ]);
         return {
            _id: friendship._id.toString(),
            ownerId: friendRequest.senderId.toString(),
            targetId: authId,
            type: "friend",
         }
      }

      // check if friendship can be declined
      else if (!response && (friendRequest.receiverId.toString() === authId || friendRequest.senderId.toString() === authId)) {
         await this.repository.deleteFriendRequest(_id);
         return {
            _id: '0',
            ownerId: friendRequest.senderId.toString(),
            targetId: authId,
            type: 'none',
         }
      }

      // whatever the client is attempting to do got rejected
      else { throw new UnauthorizedError('Invalid credentials'); }
   }

   async updateAccount(params: UpdateAccountParams): Promise<UserType> {
      const { authId, name, email, bio, image } = params;
      let savedImage: ImageType | undefined;

      const conflictUserList = await this.repository.getExactUserList({ name, email });
      conflictUserList.filter((conflictUser) => !(conflictUser._id.toString() === authId))

      if(conflictUserList.length > 0) {
         const conflictingUser = {
            _id: "0",
            name: name || "",
            email: email || "",
         }
         throw new ConflictError(buildConflictString(conflictingUser, conflictUserList)!) 
      }

      // replace the image if one has been provided
      if (image){
         const oldUser = await this.repository.getUser(authId);
         if (oldUser?.image) {
            await this.imagesService.deleteImage('avatars', oldUser.image.filename)
         }
         savedImage = await this.imagesService.saveImage('avatars', image.filename, authId)
      }

      const updatedUser = this.repository.updateUser({ _id: authId, name, email, bio, image: savedImage });
      return removeMongooseNoise(updatedUser) as UserType;
   }
}