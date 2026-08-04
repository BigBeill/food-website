'use client';

import { useState, useRef } from 'react'
import GrowingText from '@/shared/components/GrowingText';
import { RelationshipType, UserType } from '../domain/user.types';
import ImageUploader from '@/features/images/components/ImageUploader';
import { useRouter } from 'next/navigation';
import useAuth from '@/features/auth/hooks/useAuth';
import { unpackImage } from '@/features/images/services/image.services';
import useServiceState from '@/shared/hooks/useServiceState';
import { userService } from '../services/user.service';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import LoadingPage from '@/shared/components/stateComponents/LoadingPage';
import ErrorPage from '@/shared/components/stateComponents/ErrorPage';
import styles from './profilePage.module.scss';
import { ButtonOval, ButtonShielded } from '@/shared/components/Button.components';
import NotFoundPage from '@/shared/components/stateComponents/NotFoundPage';
import { InputTextArea } from '@/shared/components/Input.components';
import { DataHandle } from '@/shared/shared.types';

interface ProfilePageProps {
   userId?: string;
}
export default function ProfilePage({ userId }: ProfilePageProps) {

   const router = useRouter();
   const { authId } = useAuth();

   const userState = useServiceState((): Promise<UserType> => {
      const requestId = userId ?? authId;
      if (requestId) { return userService.get(requestId, { includeRelationship: true }); }
      else {
         router.replace('/login');
         throw new Error ("This page is not accessible without being logged in");
      }
   }, [userId]);

   switch (userState.status) {
      case 'loading':
         return <LoadingPage />
      case 'not-found':
         return <NotFoundPage />
      case 'error':
         return <ErrorPage />
      case 'ready':
         return <ProfileView user={ userState.data } updateUser={ userState.overrideOutput } />
   }
}

function ProfileView({ user, updateUser }: { user: UserType, updateUser: (input: UserType) => void }) {

   const titleParent = useRef(null);
   const router = useRouter();
   const { logout } = useAuth();

   const nameRef = useRef<DataHandle<string>>(null);
   const bioRef = useRef<DataHandle<string>>(null);

   const [modifiedUser, setModifiedUser] = useState<UserType | null>(null);
   const [imageBuffer, setImageBuffer] = useState<File | null>(null);

   const userMutator = useServiceMutation((newUser: UserType): Promise<UserType> => { return userService.update(newUser); })

   async function saveChanges() {
      if (!modifiedUser) { return; }

      const mutatedUser = await userMutator.send(modifiedUser);
      updateUser({ ...mutatedUser, relationship: user.relationship });
      setModifiedUser(null);
   }

   // mutator for setting the relationship.type field of another user
   const relationshipMutator = useServiceMutation((newRelationship: 'none' | 'requestReceived' | 'friend'): Promise<RelationshipType> => {
      const relationship: RelationshipType = user.relationship!;
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

   async function updateRelationship(newRelationship: 'none' | 'requestReceived' | 'friend') {
      const mutatedRelationship = await relationshipMutator.send(newRelationship);
      updateUser({ ...user, relationship: mutatedRelationship });
   }

   // handle logout function
   function handleLogout() {
      logout()
         .then(() => router.push('/login'));
   }

   return (
      <div className={ styles.userProfile }>
         <div ref={ titleParent } className='centredVertically'>
            <GrowingText text={ user.name } parentDiv={ titleParent } />
         </div>
         <div>
            { !modifiedUser ? (
               <img className='consumeSpace' { ...unpackImage(user.image) }/>
            ) : (
               <ImageUploader
                  imageBuffer={ imageBuffer }
                  setImageBuffer={ setImageBuffer }
                  oldImage={ user.image }
                  category={ 'user' }
               />
            ) }
         </div>

         <div> {/* styleDiv, should not contain anything */} </div>

         <div>
            <p>id: { String(user._id) }</p>
            <p>username: { user.name }</p>
         </div>

         <InputTextArea 
            label='Personal Bio' 
            placeholder='Talk about yourself' 
            dataRef={ bioRef } 
            initial={ user.bio }
            readOnly={ !modifiedUser }
            substitute='Bio not yet created'
         />

         <div> {/* styleDiv, should not contain anything */} </div>

         {/* display the appropriate set of two buttons */}
         <div className="splitSpace">
            { modifiedUser ? (
               <>
                  <ButtonShielded key='save' message='Save Changes' loadingState={ userMutator.status === 'loading' } onClick={ saveChanges } />
                  <ButtonShielded key='delete' message='Delete Changes' onClick={ () => { setModifiedUser(null); } }/>
               </>
            ) : user.relationship?.type == "none" ? (
               <>
                  <ButtonOval loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('requestReceived'); } }>Send friend request</ButtonOval>
               </>
            ) : user.relationship?.type == "friend" ? (
               <>
                  <ButtonShielded message='Remove Friend' loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('none') } } />
               </>
            ) : user.relationship?.type == "requestReceived" ? (
               <>
                  <ButtonOval loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('none') } }>Cancel friend request</ButtonOval>
               </>
            ) : user.relationship?.type == "requestSent" ? (
               <>
                  <ButtonOval loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('friend'); } }>Accept friend request</ButtonOval>
                  <ButtonOval loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('none'); } }>Reject friend request</ButtonOval>
               </>
            ) : user.relationship?.type == "self" ? (
               <>
                  <ButtonOval onClick={ () => { setModifiedUser(user); } }> edit account </ButtonOval>
                  <ButtonShielded key='logout' message="logout" onClick={ () => { handleLogout(); } }/>
               </>
            ) : null }
         </div>

      </div >
   )
}