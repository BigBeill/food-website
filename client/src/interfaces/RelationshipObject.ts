/*
type:
   0: no relationship
   1: friends
   2: received friend requests
   3: sent friend requests
*/
export default interface RelationshipObject {
   _id: string;
   type: number;
}