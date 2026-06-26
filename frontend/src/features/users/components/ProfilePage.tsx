'use client';

import { useEffect, useState, useRef } from 'react'
import GrowingText from '@/shared/components/GrowingText';
import { UserType } from '../domain/user.types';
import ImageUploader from '@/features/images/components/ImageUploader';
import { useRouter } from 'next/navigation';
import useAuth from '@/features/auth/hooks/useAuth';
import { userService } from '../services/user.service';
import { unpackImage } from '@/features/images/services/image.services';

interface ProfilePageProps {
   userId?: string;
}
export default function ProfilePage({userId}: ProfilePageProps) {
   const titleParent = useRef(null);
   const router = useRouter();
   const { authUserId, logout } = useAuth();

   const [user, setUser] = useState<UserType>({_id: '', name: '', email: '', bio: '', relationship: undefined });
   const [imageBuffer, setImageBuffer] = useState<File | null>(null);

   const [editMode, setEditMode] = useState<boolean>(false);
   const [buttonSafety, setButtonSafety] = useState<boolean>(true);

   useEffect(() => {
      if (!userId && !authUserId) { 
         router.replace('/login');
         return; 
      }

      setEditMode(false);
      setImageBuffer(null);

      userService.get((userId || authUserId)!, { includeRelationship: true })
      .then((response) => {
         setUser(response);
      })
      .catch((error) => console.error(error));

   }, [userId, authUserId, router]);

   function exitEditMode(saveChanges: boolean) {
      if (saveChanges) {
         const formData = new FormData();
         formData.append("username", user.name);
         formData.append("email", user.email ?? "");
         formData.append("bio", user.bio ?? "");
         if (imageBuffer instanceof File) {
            formData.append("image", imageBuffer);
         }
         userService.update({ user: formData })
         .catch((error) => console.error(error));
      }
      else {
         router.refresh();
      }
      setEditMode(false);
   }

   function sendFriendRequest () {
      if (!authUserId) { return; }
      userService.sendFriendRequest(user._id)
      .then((response) => setUser((previous) => ({...previous, relationship: response})))
      .catch((error) => console.error(error));
   }

   function processFriendRequest(accept: boolean) {
      if (!user.relationship) { return; }
      userService.processFriendRequest(user.relationship._id, { accept })
      .then((response) => setUser((previous) => ({...previous, relationship: response})))
      .catch((error) => console.error(error))
   }

   function removeFriend() {
      if (!user.relationship) { return; }
      userService.removeFriend(user.relationship._id)
      .then((response) => setUser((previous) => ({...previous, relationship: response})))
      .catch((error) => console.error(error));
   }

   // handle logout function
   function handleLogout() {
      logout()
      .then(() => router.push('/login'));
   }

   return (
      <div className='userObjectView fullViewPage'>
         <div ref={titleParent} className='centredVertically'>
            <GrowingText text={user.name} parentDiv={titleParent} />
         </div>
         <div>
            { editMode ? (
               <ImageUploader
                  imageBuffer={imageBuffer}
                  setImageBuffer={setImageBuffer}
                  oldImage={user.image}
                  category={'user'}
               />
            )
            : (
               <img
                  className='consumeSpace'
                  {...unpackImage({ category: 'user', image: user.image})}
               />
            )}
         </div>

         <div> {/* styleDiv, should not contain anything */} </div>

         <div>
            <p>_id: {user._id}</p>
            <p>username: {user.name}</p>
         </div>
         <div className='textInputParent bottomPadding'>
            { editMode ? (
               <>
                  <label htmlFor="bio">Personal Bio</label>
                  <textarea id="bio" value={user.bio} onChange={ (event) => { setUser({ ...user, bio: event.target.value }); } } />
               </> 
            ) : (
               <>
                  <h4>Personal Bio</h4>
                  { user.bio ? <p>{user.bio}</p> : <p>No bio available</p> }
               </>
            )}
         </div>

         <div> {/* styleDiv, should not contain anything */} </div>

         {/* display the appropriate set of two buttons */}
         <div className="splitSpace smallerGap">
            { !user || !user.relationship ? null : editMode ? (
               <>
                  <button onClick={ () => { exitEditMode(true); } }>Save Changes</button>
                  <button onClick={ () => { exitEditMode(false); } }>Delete Changes</button>
               </>
            ) : user.relationship.type == "none" ? (
               <>
                  <div></div>
                  <button onClick={ () => { sendFriendRequest(); } }>Send friend request</button>
               </>
            ) : user.relationship.type == "friend" ? (
               <>
                  <div></div>
                  <div className='devisableButton'>
                     <button onClick={() => { removeFriend(); }}>Remove friend</button>
                     <button className={buttonSafety ? 'hideButton' : 'showButton'} onClick={() => { setButtonSafety(true); }} >Cancel</button>
                  </div>
               </>
            ) : user.relationship.type == "requestReceived" ? (
               <>
                  <div></div>
                  <button onClick={ () => { processFriendRequest(false); } }>Cancel friend request</button>
               </>
            ) : user.relationship.type == "requestSent" ? (
               <>
                  <button onClick={ () => { processFriendRequest(true); } }>Accept friend request</button>
                  <button onClick={ () => { processFriendRequest(false); } }>Reject friend request</button>
               </>
            ) : user.relationship.type == "self" ? (
               <>
                  <button onClick={ () => { setEditMode(true); } }> edit account </button>
                  <button onClick={ () => { handleLogout(); } }> logout </button>
               </>
            ) : null }
         </div>

      </div >
   )
}