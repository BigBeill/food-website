import RelationshipObject from "./RelationshipObject";
import ImageObject from "./ImageObject";

export default interface UserObject {
   _id: string;
   username: string;
   email?: string;
   bio?: string;
   image?: ImageObject;
   relationship?: RelationshipObject;
}