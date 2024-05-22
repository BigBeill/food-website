import React from 'react'
import  { Navigate } from 'react-router-dom'
import UserPin from '../components/UserPin'

function Profile(data) {
  if (data.userData._id == ""){
    return <Navigate to='/login' />
  }

  return(
    <div className='profile splitSpace'>
      <UserPin userData = {data}/>
      <div className='buttonDiv'>
        <button>edit account -&gt; </button>
        <button>logout -&gt; </button>
      </div>
    </div>
  )
}

export default Profile