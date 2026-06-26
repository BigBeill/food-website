import sendServerRequest from "@/shared/lib/api"
import { FolderType, RelationshipType, UserType } from "../domain/user.types"

interface getParams {
   includeRelationship: boolean
}

interface folderListParams {
   skip?: number;
   limit?: number
   includeCount?: boolean
}

interface processFriendRequestParams {
   accept: boolean;
}

interface searchParams{
   _id?: string
   name?: string
   category?: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none';
   skip?: number;
   limit?: number;
   includeCount?: boolean;
}

interface updateParams {
   user: FormData;
}

export const userService = {
   defineRelationship: (userId: string) =>
      sendServerRequest<RelationshipType>({
         url: `/user/defineRelationship/${userId}`,
         method: 'get'
      }),

   folderList: (params: folderListParams) =>
      sendServerRequest<FolderType[] | {count: number, list: FolderType[]}>({
         url: '/user/folderList',
         method: 'get',
         body: params
      }),

   get: (userId: string, params?: getParams) =>
      sendServerRequest<UserType>({
         url: `/user/get/${userId}`,
         method: 'get',
         body: params,
      }),

   processFriendRequest: (relationshipId: string, params: processFriendRequestParams) =>
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

   search: (params: searchParams) =>
      sendServerRequest<UserType[] | {count: number, list: UserType[]}>({
         url: `/user/search`,
         method: 'get',
         body: params
      }),

   sendFriendRequest: (userId: string) =>
      sendServerRequest<RelationshipType>({
         url: `/user/sendFriendRequest/${userId}`,
         method: 'push',
      }),

   update: (params: updateParams) =>
      sendServerRequest({
         url: `/user/update`,
         method: 'put',
         body: params,
      }),
}