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

   const [userData, setUserData] = useState({});
   const [relationship, setRelationship] = useState({type: 0, _id: '0'});

   useEffect(() => {
      if (!_id){
         if (context.userData) setUserData(context.userData);
         else navigate('/login');
      }
      else {
         axios({
            method: 'GET', 
            url: `user/info/${_id}`
         })
         .then (response => {
            setUserData(response);
         });
         axios({
            method: 'GET',
            url: `user/defineRelationship/${_id}`
         })
         .then(response => {
            setRelationship(response);
         });
      }
   }, [_id]);

   // handle logout function
   const handleLogout = () => {
      const postRequest = {
         method: 'POST',
         url: 'user/logout',
      }
      axios(postRequest)
      .then(() => {
         location.assign('/')
      })
   };

   if (!userData || !relationship) return <div><Loading /></div>;

   return (
      <div className='displayUserData'>
         <div ref={titleParent} className='centredVertically'>
            <GrowingText text={userData.username} parentDiv={titleParent} />
         </div>
         <div>
            <img className="consumeSpace" src="../../public/profile-photo.png" alt='profile picture' />
         </div>
         <div></div>
         <div>

         </div>
         <div>
            <h4>Bio</h4>

         </div>
         <div></div>
         <div className="splitSpace smallerGap">
            <button
            onClick={ () => { editAccount(); } }
            >
               edit account
            </button>
            <button
            onClick={ () => { handleLogout(); } }
            >
               logout
            </button>
         </div>

      </div >
   )
}