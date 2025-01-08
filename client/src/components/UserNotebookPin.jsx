// external imports
import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheck, faUser, faUserPlus, faX } from '@fortawesome/free-solid-svg-icons';

// internal imports
import GrowingText from "./GrowingText";
import axios from "../api/axios";

export default function UserNotebookPin({ userData }) {

   const [iconsHidden, setIconsHidden] = useState(false);
   const [relationship, setRelationship] = useState({ type: 0, _id: '0' });

   const parentRefs = useRef(null);

   useEffect(() => {
      axios({ method: 'get', url: `user/defineRelationship/${userData._id}` })
      .then((response) => {
         setRelationship(response);
      })
   }, [userData]);

   useEffect(() => { 
      setIconsHidden(false);
   }, [relationship]);

   function sendFriendRequest () {
      setIconsHidden(true);
      axios({ method: 'post', url: 'user/sendFriendRequest', data: {userId: userData._id} })
      .then((response) => {
         setRelationship({ type: 3, _id: response._id });
      });
   }

   function acceptFriendRequest () {
      setIconsHidden(true);
      axios({ method: 'post', url: 'user/processFriendRequest', data: { requestId: relationship._id, accept: true } })
      .then((response) => {
         setRelationship({ type: 1, _id: response._id});
      });
   }

   function rejectFriendRequest () {
      setIconsHidden(true);
      axios({ method: 'post', url: 'user/processFriendRequest', data: { requestId: relationship._id, accept: false } })
      .then(() => {
         setRelationship({ type: 0, _id: '0' });
      });
   }

   return (
      <div className="pin" >
         <div className="title" ref={parentRefs}>
            <GrowingText text={userData.username} parentDiv={parentRefs} />
         </div>

         <div className={`icons ${iconsHidden ? 'hidden' : ''}`}>
            { relationship.type == 0 ? (
               <FontAwesomeIcon icon={faUserPlus} onClick={() => { sendFriendRequest() } } />
            ) : relationship.type == 1 ? (
               <FontAwesomeIcon icon={faUser} />
            ) : relationship.type == 2 ? (
               <>
                  <FontAwesomeIcon icon={faCheck} onClick={ () => { acceptFriendRequest() } } />
                  <FontAwesomeIcon icon={faX} onClick={ () => { rejectFriendRequest() } } />
               </>
            ) : relationship.type == 3 ? (
               <FontAwesomeIcon icon={faBan} onClick={ () => { rejectFriendRequest() } } />
            ) : null }
         </div>
      </div>
   )
}
