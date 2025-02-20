import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheck, faUser, faUserPlus, faX } from '@fortawesome/free-solid-svg-icons';

import axios from '../api/axios';
import GrowingText from './GrowingText';
import UserObject from '../interfaces/UserObject';
import RelationshipObject from '../interfaces/RelationshipObject';

interface UserPinProps {
  userData: UserObject;
}

export default function UserPin({ userData }: UserPinProps) {
  
  const navigate = useNavigate();
  const titleRef = useRef(null);

  const [iconsHidden, setIconsHidden] = useState<boolean>(false);
  const [relationship, setRelationship] = useState<RelationshipObject>({ type: 0, _id: '0' });

  useEffect(() => {
    axios({
      method: 'get',
      url: `user/defineRelationship/${userData._id}`
    })
    .then((response) => {
      setRelationship(response);
    })
  }, [userData]);

  useEffect(() => { 
    setIconsHidden(false);
  }, [relationship]);
  

  function viewProfile() {
    navigate(`/profile/${userData._id}`);
  }

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
    <div className='userPin'>
      <div className="centredVertically" ref={titleRef} onClick={ () => { viewProfile() } }>
        <GrowingText text={userData.username} parentDiv={titleRef} />
      </div>
      <div onClick={ () => { viewProfile() } }>
        <img src='../../public/profile-photo.png' alt='profile picture' />
      </div>

      <div className='styleDiv'></div>

      <div className='contactInformation'>
        <p>email: {userData.email}</p>
        <p>
          relationship: {
          relationship.type == 0 ? 'none' : 
          relationship.type == 1 ? 'friends' : 
          relationship.type == 4 ? 'your account' : 
          'friendship pending'}
        </p>
      </div>
      <div className={`icons ${iconsHidden ? 'hidden' : ''}`}>
        { relationship.type == 0 ? (
          <FontAwesomeIcon icon={faUserPlus} onClick={() => { sendFriendRequest() } } />
        ) : relationship.type == 1 ? (
          <FontAwesomeIcon icon={faUser} onClick={ () => { viewProfile() } } />
        ) : relationship.type == 2 ? (
          <>
            <FontAwesomeIcon icon={faCheck} onClick={ () => { acceptFriendRequest() } } />
            <FontAwesomeIcon icon={faX} onClick={ () => { rejectFriendRequest() } } />
          </>
        ) : relationship.type == 3 ? (
          <FontAwesomeIcon icon={faBan} onClick={ () => { rejectFriendRequest() } } />
        ) : relationship.type == 4 ? (
          <FontAwesomeIcon icon={faUser} onClick={ () => { viewProfile() } } />
        ) : null }
      </div>
    </div>
  )
}