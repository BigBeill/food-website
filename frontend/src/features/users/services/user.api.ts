import sendServerRequest from "@/shared/lib/api"
import { FolderType, RelationshipType, UserType } from "../domain/user.types"
import { PaginatedListType } from "@/shared/shared.types";

interface GetParams {
   includeRelationship: boolean
}

interface SearchFolderParams {
   skip?: number;
   limit?: number
   includeCount?: boolean
}

interface ProcessFriendRequestParams {
   accept: boolean;
}

interface SearchParams {
   _id?: string
   name?: string
   category?: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none';
   skip?: number;
   limit?: number;
   includeCount?: boolean;
}

export const userApi = {
   defineRelationship: (userId: string) =>
      sendServerRequest<RelationshipType>({
         url: `/user/defineRelationship/${userId}`,
         method: 'get'
      }),

   get: (userId: string, params?: GetParams) =>
      sendServerRequest<UserType>({
         url: `/user/get/${userId}`,
         method: 'get',
         body: params,
      }),

   processFriendRequest: (relationshipId: string, params: ProcessFriendRequestParams) =>
      sendServerRequest<RelationshipType>({
         url:`/user/processFriendRequest/${relationshipId}`,
         method: 'post',
         body: params,
      }),

   removeFriend: (relationshipId: string) => 
      sendServerRequest<RelationshipType>({
         url: `/user/removeFriend/${relationshipId}`,
         method: 'post',
      }),

   search: (params: SearchParams) =>
      sendServerRequest<PaginatedListType<UserType[]>>({
         url: `/user/search`,
         method: 'get',
         body: params
      }),

   searchFolder: (params: SearchFolderParams) =>
      sendServerRequest<PaginatedListType<FolderType[]>>({
         url: '/user/folderList',
         method: 'get',
         body: params
      }),

   sendFriendRequest: (userId: string) =>
      sendServerRequest<RelationshipType>({
         url: `/user/sendFriendRequest/${userId}`,
         method: 'push',
      }),

   update: (user: FormData) =>
      sendServerRequest<UserType>({
         url: `/user/update`,
         method: 'put',
         body: { user },
      }),
}