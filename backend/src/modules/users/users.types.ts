import type { ImageType } from "../images/images.types";

export interface UserType {
   _id: string;
   name: string;
   email?: string;
   bio?: string;
   image?: ImageType;
   relationship?: RelationshipType;
}

export interface RelationshipType {
   _id: string;
   ownerId: string;
   targetId: string;
   type: "none" | "friend" | "requestReceived" | "requestSent" | "self";
}

export interface FriendFolderType {
   _id: string;
   title: string;
   content?: UserType[];
}