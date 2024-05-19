import React from 'react'
import  { Navigate } from 'react-router-dom'
import UserPin from '../components/UserPin'

function Profile(data) {
  if (data.userData._id == ""){
    return <Navigate to='/login' />
  }

  return(
    <div className='profile'>
      <UserPin userData = {userData}/>
    </div>
  )
}

export default Profile