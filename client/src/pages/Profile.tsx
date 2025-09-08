import { useEffect, useState, useRef } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

import axios from '../api/axios';
import GrowingText from '../components/GrowingText';
import Loading from '../components/Loading';
import UserObject from '../interfaces/UserObject';
import ImageUploader from '../components/ImageUploader';

const database = import.meta.env.VITE_SERVER_LOCATION;

export default function Profile() {
   const titleParent = useRef(null);
   const navigate = useNavigate();
   const { userId } = useOutletContext<{userId: string }>();
   const { targetId = userId } = useParams();

   const [userObject, setUserObject] = useState<UserObject>({_id: '', username: '', email: '', bio: '', relationship: undefined });

   const [imageBuffer, setImageBuffer] = useState<File | null>(null);

   const [fetchingUserData, setFetchingUserData] = useState<boolean>(true);
   const [editMode, setEditMode] = useState<boolean>(false);

   const [buttonSafety, setButtonSafety] = useState<boolean>(true);

   function resetUserObject() {
      axios({ method: 'get', url: `user/getObject/${targetId}/true` })
      .then((response) => { 
         setUserObject(response);
         setFetchingUserData(false);
      });
   }

   useEffect(() => {
      setEditMode(false);

      setFetchingUserData(true);
      if (!targetId) { navigate('/login'); }
      resetUserObject();
   }, [targetId]);

   function exitEditMode(saveChanges: boolean) {
      if (!userObject) { return; }
      if (saveChanges) {
         const formData = new FormData();
         formData.append("username", userObject.username);
         formData.append("email", userObject.email ?? "");
         formData.append("bio", userObject.bio ?? "");
         if (imageBuffer instanceof File) {
            formData.append("image", imageBuffer);
         }
         axios({ method: 'post', url: 'user/updateAccount', data: formData })
         .then(() => { resetUserObject(); });
      }
      else { resetUserObject(); }
      setEditMode(false);
   }

   function sendFriendRequest () {
      if (!userObject) { return; }
      axios({ method: 'post', url: 'user/sendFriendRequest', data: {targetId: userObject._id} })
      .then((response) => { setUserObject((currentUserObject) => ({ ...currentUserObject, relationship: { _id: response._id, target: userId, type: "requestReceived" } })); });
   }

   function processFriendRequest(accept: boolean) {
      if (!userObject?.relationship) { return; }
      if (accept) {
         axios({ method: 'post', url: 'user/processFriendRequest', data: { requestId: userObject.relationship._id, accept: true } })
         .then((response) => { setUserObject((currentUserObject) => ({ ...currentUserObject, relationship: { _id: response._id, target: userId, type: "friend" } })); });
      }
      else {
         axios({ method: 'post', url: 'user/processFriendRequest', data: { requestId: userObject.relationship._id, accept: false } })
         .then(() => { setUserObject((currentUserObject) => ({ ...currentUserObject, relationship: { _id: '0', target: userId, type: "none" } })); });
      }
   }

   function removeFriend() {
      if (!userObject?.relationship) { return; }
      if (buttonSafety) {
         setButtonSafety(false);
         return;
      }
      axios({ method: 'post', url: 'user/deleteFriend', data: { relationshipId: userObject.relationship._id } })
      .then(() => { setUserObject((currentUserObject) => ({ ...currentUserObject, relationship: { _id: '0', target: userId, type: "none" } })); });
   }

   // handle logout function
   function handleLogout() {
      axios({ method: 'post', url: 'authentication/logout' })
      .then(() => { location.assign('/') })
   }

   // don'd load page until data is fetched
   if (fetchingUserData) { return <Loading /> }

   return (
      <div className='userObjectView fullViewPage'>
         <div ref={titleParent} className='centredVertically'>
            <GrowingText text={userObject.username} parentDiv={titleParent} />
         </div>
         <div>
            { editMode ? (
               <ImageUploader 
                  file={ userObject.image instanceof File ? userObject.image : undefined } 
                  setFile={setImageBuffer} 
               />
            )
            : (
               <img
                  className="consumeSpace" 
                  src={userObject.image?.filename ? `${database}${userObject.image.url}` : "/profile-photo.png"} 
                  alt='profile picture' 
               />
            )}
         </div>

         <div> {/* styleDiv, should not contain anything */} </div>

         <div>
            <p>_id: {userObject._id}</p>
            <p>username: {userObject.username}</p>
            <p>email: {userObject.email}</p>
         </div>
         <div className='textInputParent bottomPadding'>
            { editMode ? (
               <>
                  <label htmlFor="bio">Personal Bio</label>
                  <textarea id="bio "value={userObject.bio} onChange={ (event) => { setUserObject({ ...userObject, bio: event.target.value }); } } />
               </> 
            ) : (
               <>
                  <h4>Personal Bio</h4>
                  { userObject.bio ? <p>{userObject.bio}</p> : <p>No bio available</p> }
               </>
            )}
         </div>

         <div> {/* styleDiv, should not contain anything */} </div>

         {/* display the appropriate set of two buttons */}
         <div className="splitSpace smallerGap">
            { !userObject || !userObject.relationship ? null : editMode ? (
               <>
                  <button onClick={ () => { exitEditMode(true); } }>Save Changes</button>
                  <button onClick={ () => { exitEditMode(false); } }>Delete Changes</button>
               </>
            ) : userObject.relationship.type == "none" ? (
               <>
                  <div></div>
                  <button onClick={ () => { sendFriendRequest(); } }>Send friend request</button>
               </>
            ) : userObject.relationship.type == "friend" ? (
               <>
                  <div></div>
                  <div className='devisableButton'>
                     <button onClick={() => { removeFriend(); }}>Remove friend</button>
                     <button className={buttonSafety ? 'hideButton' : 'showButton'} onClick={() => { setButtonSafety(true); }} >Cancel</button>
                  </div>
               </>
            ) : userObject.relationship.type == "requestReceived" ? (
               <>
                  <div></div>
                  <button onClick={ () => { processFriendRequest(false); } }>Cancel friend request</button>
               </>
            ) : userObject.relationship.type == "requestSent" ? (
               <>
                  <button onClick={ () => { processFriendRequest(true); } }>Accept friend request</button>
                  <button onClick={ () => { processFriendRequest(false); } }>Reject friend request</button>
               </>
            ) : userObject.relationship.type == "self" ? (
               <>
                  <button onClick={ () => { setEditMode(true); } }> edit account </button>
                  <button onClick={ () => { handleLogout(); } }> logout </button>
               </>
            ) : null }
         </div>

      </div >
   )
}