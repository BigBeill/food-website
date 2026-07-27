import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheck, faUser, faUserPlus, faX } from '@fortawesome/free-solid-svg-icons';
import GrowingText from '@/shared/components/GrowingText';
import { UserType } from '../domain/user.types';
import { useRouter } from 'next/router';
import { userService } from '../services/user.api';
import useAuth from '@/features/auth/hooks/useAuth';
import { unpackImage } from '@/features/images/services/image.services';

interface UserPinProps {
   initialUser: UserType;
}

export default function UserPin({ initialUser }: UserPinProps) {
  
   const router = useRouter();
   const titleRef = useRef(null);

   const { authUserId } = useAuth();

   const [user, setUser] = useState<UserType>(initialUser);
   const [hideIcons, setHideIcons] = useState<boolean>(false);

   // make sure the user has a defined relationship with the authenticated user 
   useEffect(() => {
      if(authUserId && !user.relationship) {
         userService.defineRelationship(user._id)
         .then((response) => setUser((previous) => ({...previous, relationship: response})))
         .catch((error) => console.error(error));
      }
   }, [user]);

   // useEffect for handling changes in the relationship
   useEffect(() => {
      setHideIcons(false);
   }, [user.relationship]);
   
   function viewProfile() {
      router.push(`/user/${user._id}`)
   }

   function sendFriendRequest () {
      setHideIcons(true);
      userService.sendFriendRequest(user._id)
      .then((response) => setUser((previous) => ({ ...previous, relationship: response})))
      .catch((error) => console.error(error));
   }
   
   function processFriendRequest (accept: boolean) {
      if (!user.relationship) { return; }
      setHideIcons(true);
      userService.processFriendRequest(user.relationship._id, { accept })
      .then((response) => setUser((previous) => ({ ...previous, relationship: response })))
      .catch((error) => console.error(error));
   }

   function relationshipLabel() { 
      if (!user.relationship) { return 'none'; }
      switch(user.relationship.type) {
         case 'none' : return 'none';
         case 'friend': return 'friends';
         case 'self': return 'your account';
         default: return 'friendship pending';
      }
   }
   return (
      <div className='userObjectView pin'>
         <div className="centredVertically" ref={titleRef} onClick={ () => { viewProfile() } }>
            <GrowingText text={user.name} parentDiv={titleRef} />
         </div>
         <div onClick={ () => { viewProfile() } }>
            <img
               className='consumeSpace'
               {...unpackImage({ category: 'user', image: user.image})}
            />
         </div>

         <div className='styleDiv'></div>

         <div className='contactInformation'>
         <p>
            Relationship: {
            !user.relationship ? 'none' :
            user.relationship.type == 'none' ? 'none' : 
            user.relationship.type == 'friend' ? 'friends' : 
            user.relationship.type == 'self' ? 'your account' : 
            'friendship pending'}
         </p>
         </div>
         <div className={`icons ${hideIcons ? 'hidden' : ''}`}>
         { !user.relationship ? null 
         : user.relationship.type == 'none' ? (
            <FontAwesomeIcon icon={faUserPlus} onClick={() => { sendFriendRequest() } } />
         ) : user.relationship.type == 'friend' ? (
            <FontAwesomeIcon icon={faUser} onClick={ () => { viewProfile() } } />
         ) : user.relationship.type == 'requestReceived' ? (
            <FontAwesomeIcon icon={faBan} onClick={ () => { processFriendRequest(false) } } />
         ) : user.relationship.type == 'requestSent' ? (
            <>
               <FontAwesomeIcon icon={faCheck} onClick={ () => { processFriendRequest(true) } } />
               <FontAwesomeIcon icon={faX} onClick={ () => { processFriendRequest(false) } } />
            </>
         ) : user.relationship.type == 'self' ? (
            <FontAwesomeIcon icon={faUser} onClick={ () => { viewProfile() } } />
         ) : null }
         </div>
      </div>
   )
}