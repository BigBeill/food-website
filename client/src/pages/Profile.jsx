import React from 'react'
import UserPin from '../components/UserPin'

function Profile(userData) {
  return(
    <div className='profile'>
      <UserPin userData = {userData}/>
    </div>
  )
}

export default Profile