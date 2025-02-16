import UserObject from "./UserObject";

export default interface FolderObject {
   _id: string;
   content: UserObject[];
}