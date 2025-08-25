import RelationshipObject from "./RelationshipObject";
import imageObject from "./ImageObject";

export default interface UserObject {
   _id: string;
   username: string;
   email?: string;
   bio?: string;
   image?: imageObject | File;
   relationship?: RelationshipObject;
}