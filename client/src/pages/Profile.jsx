import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import UserPin from '../components/UserPin'

function Profile({userData}) {
  const navigate = useNavigate();
  console.log("profile:", userData)
  
  //some placeholder text while page is waiting for user data to be collected
  if (!userData.collected) return(<p>collecting user data</p>);
  
  //make sure user is signed in before trying to render there profile
  if (!userData._id) navigate('/login');

  return (
    <div className='profile splitSpace'>
      <UserPin userData={userData} />
    </div >
  )
}

export default Profile