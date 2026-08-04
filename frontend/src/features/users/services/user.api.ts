import sendServerRequest from "@/shared/lib/api"
import { FolderType, RelationshipType, UserType } from "../domain/user.types"
import { PaginatedListType } from "@/shared/shared.types";

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
   _id?: string
   folderId?: string;
   name?: string
   category?: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none';
   skip?: number;
   limit?: number;
}

export const userApi = {
   defineRelationship: (userId: string) =>
      sendServerRequest<RelationshipType>({
         url: `/users/defineRelationship/${userId}`,
         method: 'get'
      }),

   get: (userId: string, params?: GetParams) =>
      sendServerRequest<UserType>({
         url: `/users/get/${userId}`,
         method: 'get',
         body: params,
      }),

   processFriendRequest: (relationshipId: string, params: ProcessFriendRequestParams) =>
      sendServerRequest<RelationshipType>({
         url:`/users/processFriendRequest/${relationshipId}`,
         method: 'post',
         body: params,
      }),

   removeFriend: (relationshipId: string) => 
      sendServerRequest<RelationshipType>({
         url: `/users/removeFriend/${relationshipId}`,
         method: 'post',
      }),

   search: (params: SearchParams) =>
      sendServerRequest<PaginatedListType<UserType>>({
         url: `/users/search`,
         method: 'get',
         body: params
      }),

   searchFolder: (params: SearchFolderParams) =>
      sendServerRequest<PaginatedListType<FolderType>>({
         url: '/users/folderList',
         method: 'get',
         body: params
      }),

   sendFriendRequest: (userId: string) =>
      sendServerRequest<RelationshipType>({
         url: `/users/sendFriendRequest/${userId}`,
         method: 'push',
      }),

   update: (user: FormData) =>
      sendServerRequest<UserType>({
         url: `/users/update`,
         method: 'put',
         body: { user },
      }),
}