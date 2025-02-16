/*
type:
   0: no relationship
   1: friends
   2: received friend requests
   3: sent friend requests
*/
export default interface RelationshipObject {
   type: number;
   _id: string;
}