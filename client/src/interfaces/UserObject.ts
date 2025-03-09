import RelationshipObject from "./RelationshipObject";

export default interface UserObject {
   _id: string;
   username: string;
   email?: string;
   bio?: string;
   relationship?: RelationshipObject;
}