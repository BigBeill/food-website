import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

import axios from '../api/axios';
import GrowingText from '../components/GrowingText';
import Loading from '../components/Loading';


export default function Profile() {
   const titleParent = useRef(null);
   const navigate = useNavigate();
   const context = useOutletContext();
   const { _id } = useParams();

   const [userData, setUserData] = useState(); // { _id, username, email, bio }
   const [relationship, setRelationship] = useState();
   const [editMode, setEditMode] = useState(false);

   useEffect(() => {
      setEditMode(false);
      
      if (!_id){
         if (!context.userData._id) { navigate('/login'); }

         axios({ method: 'GET', url: `user/info/${context.userData._id}` })
         .then((response) => { setUserData(response); });
         setRelationship({ type: 4, _id: 0 });
      }
      else {
         axios({ method: 'GET', url: `user/info/${_id}` })
         .then((response) => { setUserData(response); });
         axios({ method: 'GET', url: `user/defineRelationship/${_id}` })
         .then((response) => { setRelationship(response); });
      }
   }, [_id]);

   function exitEditMode(saveChanges) {
      if (saveChanges) {
         const requestData = {
            username: userData.username,
            email: userData.email,
            bio: userData.bio
         }
         axios({ method: 'POST', url: 'user/updateAccount', data: requestData })
      }
      else {
         let url;
         if (!_id) { url = `user/info/${context.userData._id}`; }
         else { url = `user/info/${_id}`; }
         axios({ method: 'GET', url })
         .then((response) => { setUserData(response); });
      }
      setEditMode(false);
   }

   function sendFriendRequest () {
      axios({ method: 'post', url: 'user/sendFriendRequest', data: {userId: userData._id} })
      .then((response) => { setRelationship({ type: 3, _id: response._id }); });
   }

   function processFriendRequest(accept) {
      if (accept) {
         axios({ method: 'post', url: 'user/processFriendRequest', data: { requestId: relationship._id, accept: true } })
         .then((response) => { setRelationship({ type: 1, _id: response._id}); });
      }
      else {
         axios({ method: 'post', url: 'user/processFriendRequest', data: { requestId: relationship._id, accept: false } })
         .then(() => { setRelationship({ type: 0, _id: '0' }); });
      }
   }

   // handle logout function
   const handleLogout = () => {
      axios({ method: 'POST', url: 'user/logout' })
      .then(() => { location.assign('/') })
   };

   // don'd load page until data is fetched
   if (!userData || !relationship) { return <Loading /> }

   return (
      <div className='displayUserData'>
         <div ref={titleParent} className='centredVertically'>
            <GrowingText text={userData.username} parentDiv={titleParent} />
         </div>
         <div>
            <img className="consumeSpace" src="../../public/profile-photo.png" alt='profile picture' />
         </div>

         <div> {/* styleDiv, should not contain anything */} </div>

         <div>
            <p>_id: {userData._id}</p>
            <p>username: {userData.username}</p>
            <p>email: {userData.email}</p>
         </div>
         <div className='textInputParent bottomPadding'>
            { editMode ? (
               <>
                  <label htmlFor="bio">Personal Bio</label>
                  <textarea id="bio "value={userData.bio} onChange={ (event) => { setUserData({ ...userData, bio: event.target.value }); } } />
               </> 
            ) : (
               <>
                  <h4>Personal Bio</h4>
                  { userData.bio ? <p>{userData.bio}</p> : <p>No bio available</p> }
               </>
            )}

         </div>

         <div> {/* styleDiv, should not contain anything */} </div>

         {/* display the appropriate set of two buttons */}
         <div className="splitSpace smallerGap">
            { editMode ? (
               <>
                  <button onClick={ () => { exitEditMode(true); } }>Save Changes</button>
                  <button onClick={ () => { exitEditMode(false); } }>Delete Changes</button>
               </>
            ) : relationship.type == 0 ? (
               <>
                  <div></div>
                  <button onClick={ () => { sendFriendRequest(); } }>Send friend request</button>
               </>
            ) : relationship.type == 1 ? (
               <>
                  <div></div>
                  <button>Remove friend</button>
               </>
            ) : relationship.type == 2 ? (
               <>
                  <button onClick={ () => { processFriendRequest(true); } }>Accept friend request</button>
                  <button onClick={ () => { processFriendRequest(false); } }>Reject friend request</button>
               </>
            ) : relationship.type == 3 ? (
               <>
                  <div></div>
                  <button onClick={ () => { processFriendRequest(false); } }>Cancel friend request</button>
               </>
            ) : relationship.type == 4 ? (
               <>
                  <button onClick={ () => { setEditMode(true); } }> edit account </button>
                  <button onClick={ () => { handleLogout(); } }> logout </button>
               </>
            ) : null }
         </div>

      </div >
   )
}