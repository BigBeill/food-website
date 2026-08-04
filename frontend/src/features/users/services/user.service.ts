import { PaginatedListType } from "@/shared/shared.types";
import { FolderType, RelationshipType, UserType } from "../domain/user.types";
import { userApi } from "./user.api"
import { createUserFormData } from "./user.utils";

interface GetParams {
   includeRelationship: boolean
}

interface SearchFolderParams {
   skip?: number;
   limit?: number
}

interface ProcessFriendRequestParams {
   accept: boolean;
}

interface SearchParams {
   _id?: string;
   folderId?: string;
   name?: string;
   category?: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none';
   skip?: number;
   limit?: number;
}

export const userService = {
   defineRelationship: (userId: string): Promise<RelationshipType> => {
      return userApi.defineRelationship(userId);
   },
   get: (userId: string, params?: GetParams) => {
      return userApi.get(userId, params);
   },
   processFriendRequest: (relationshipId: string, params: ProcessFriendRequestParams) => {
      return userApi.processFriendRequest(relationshipId, params);
   },
   removeFriend: (relationshipId: string) => {
      return userApi.removeFriend(relationshipId);
   },
   search: (params: SearchParams): Promise<PaginatedListType<UserType>> => {
      return userApi.search(params);
   },
   searchFolder: (params: SearchFolderParams): Promise<PaginatedListType<FolderType>> => {
      return userApi.searchFolder(params); 
   },
   sendFriendRequest: (userId: string) => {
      return userApi.sendFriendRequest(userId);
   },
   update: (user: UserType, image?: File): Promise<UserType> => {
      const userFormData = createUserFormData(user, image);
      return userApi.update(userFormData);
   },
}