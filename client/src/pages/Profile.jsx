import React from 'react'
import UserPin from '../components/UserPin'

function Profile(data) {

  const handleLogout = () => {
    const postRequest = {
      method: 'POST'
    }
    fetch('server/user/logout', postRequest)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.message == "success") { location.assign('/') }
      })
      .catch(error => {
        console.error("unable to logout", error)
      })
  };

  return (
    <div className='profile splitSpace'>
      <UserPin userData={data} />
      <div className='buttonDiv'>
        <button>edit account -&gt; </button>
        <button
          onClick={handleLogout}

        >logout -&gt; </button>
      </div>
    </div>
  )
}

export default Profile