import React, { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom';
import UserPin from '../components/UserPin'
import axios from 'axios';


function Profile() {
  const navigate = useNavigate();
  const { userData } = useOutletContext();

  // handle logout function
  const handleLogout = () => {
    const postRequest = {
      method: 'POST',
      url: 'server/user/logout',
    }
    axios(postRequest)
      .then(response => {
        console.log(response);
        if (response.data.message == "success") { location.assign('/') }
      })
      .catch(error => {
        console.error("unable to logout", error)
      })
  };

  //make sure user is signed in before trying to render there profile
  if (!userData._id) navigate('/login');

  return (
    <div className='profile splitSpace'>
      <div className="userPin">
        <div className="splitSpace">
          <UserPin userData={userData} />
          <div className="profileButtons">
            {/* <button>edit account -&t; </button> */}
            <button
              onClick={handleLogout}

            >logout -&gt; </button>
          </div>
        </div>

      </div >
    </div >
  )
}


export default Profile