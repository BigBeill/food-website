import { useRef } from 'react';
import { faBan, faCheck, faUser, faUserPlus, faX } from '@fortawesome/free-solid-svg-icons';
import GrowingText from '@/shared/components/GrowingText';
import { RelationshipType, UserType } from '../domain/user.types';
import { useRouter } from 'next/router';
import useAuth from '@/features/auth/hooks/useAuth';
import { unpackImage } from '@/features/images/services/image.services';
import { userService } from '../services/user.service';
import useServiceState from '@/shared/hooks/useServiceState';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { ButtonIconList, ButtonIconType } from '@/shared/components/Button.components';
import RequireServiceStateReady from '@/shared/components/RequireServiceStateReady';
import styles from './userPin.module.scss';

export default function UserPin({ user }: { user: UserType }) {

   const { authId } = useAuth();

   const relationshipState = useServiceState<RelationshipType>(() => {
      if (!authId) { return Promise.resolve({ _id: "0", owner: "", target: "", type: "none" }); }
      if (user.relationship) { return Promise.resolve(user.relationship); }
      else { return userService.defineRelationship(user._id); }
   }, [user]);

   return (
      <RequireServiceStateReady serviceState={relationshipState} >
         {(relationship) => <UserPinView user={ user } relationship={ relationship } />}
      </RequireServiceStateReady>
   )
   
}

function UserPinView({ user, relationship }: { user: UserType, relationship: RelationshipType }) {

   const relationshipMutation = useServiceMutation((newRelationship: 'none' | 'requestReceived' | 'friend'): Promise<RelationshipType> => {
      if (!authId) { throw new Error('cant change relationship when not signed in to an account'); }
      if (newRelationship === 'none') { 
         if (relationship.type === 'friend') { return userService.removeFriend(relationship._id); }
         else if (relationship.type === 'requestReceived' || relationship.type === 'requestSent') { return userService.processFriendRequest(relationship._id, { accept: false}); }
      }
      if (newRelationship === 'requestReceived' && relationship.type === 'none') { return userService.sendFriendRequest(relationship.owner); }
      if (newRelationship === 'friend' && relationship.type === 'requestSent') { return userService.processFriendRequest(relationship._id, { accept: true }); }

      // If the request does not match any of the above conditions and trigger a return then send an error
      console.error('Unable to set the targets relationship with this user to: ' + newRelationship + ' their current relationship with this user is: ' + relationship.type);
      throw new Error('relationship cannot be set to ' + newRelationship);
   });

   function viewProfile() {
      router.push(`/user/${user._id}`)
   }

   const normalizedRelationshipOptions: { label: string, iconList: ButtonIconType[] } = (() => {
      switch (relationship.type) {
         case "friend":
            return { label: "Friends", iconList: [{ icon: faUser, label: "view profile", onClick: viewProfile }] };
         case "requestReceived":
            return { label: "friendship pending", iconList: [{ icon: faBan, label: "cancel friend request", onClick: () => relationshipMutation.send('none') }] };
         case "requestSent":
            return { label: "friendship pending", iconList: [{ icon: faCheck, label: "Accept friend request", onClick: () => relationshipMutation.send('friend') }, { icon: faX, label: "Reject friend request", onClick: () => relationshipMutation.send('none') }] };
         case "none":
            return { label: "none", iconList: [{ icon: faUserPlus, label: "Send friend request", onClick: () => relationshipMutation.send('requestReceived') }] };
         case "self":
            return { label: "Your Account", iconList: [{ icon: faUser, label: "view profile", onClick: viewProfile }] };
         default:
            return { label: 'unknown', iconList: [] };
      }
   })();
  
   const router = useRouter();
   const titleRef = useRef(null);
   const { authId } = useAuth();

   return (
      <div className={ styles.user }>
         <GrowingText text={ user.name } onClick={ () => { viewProfile} } />
         <div onClick={ () => { viewProfile() } }>
            <img className='consumeSpace' { ...unpackImage(user.image) } />
         </div>

         <div className='styleDiv'></div>

         <div className={ styles.publicInformation }>
            <p>{ normalizedRelationshipOptions.label }</p>
         </div>
         <ButtonIconList iconList={ normalizedRelationshipOptions.iconList } />
      </div>
   )
}