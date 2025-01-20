import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheck, faUser, faUserPlus, faX } from '@fortawesome/free-solid-svg-icons';

import axios from '../api/axios';
import GrowingText from './GrowingText';


function UserPin({ userData }) {
  console.log(userData);

  const titleRef = useRef(null);

  const [iconsHidden, setIconsHidden] = useState(false);
  const [relationship, setRelationship] = useState({ type: 0, _id: '0' });

  useEffect(() => {
    axios({
      method: 'get',
      url: `user/defineRelationship/${userData._id}`
    })
    .then((response) => {
      console.log(response);
      setRelationship(response);
    })
  }, []);

  return (
    <div className='userPin'>
      <div className="centredVertically" ref={titleRef}>
        <GrowingText text={userData.username} parentDiv={titleRef} />
      </div>
      <div>
        <img src='../../public/profile-photo.png' alt='profile picture' />
      </div>

      <div className='styleDiv'></div>

      <div className='contactInformation'>
        <p>email: {userData.email}</p>
        <p>
          relationship: {relationship.type == 0 ? 'not friends' : relationship.type == 1 ? 'friends' : 'pending'}
        </p>
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

export default UserPin