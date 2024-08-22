import React, { useEffect, useState } from 'react'
import axios from 'axios';


function UserPin(userData) {

  const [userName, setUserName] = useState(userData.userData.username);
  const [email, setEmail] = useState(userData.userData.email);
  const [bio, setBio] = useState(userData.userData.bio);
  console.log(userData);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  //handle update account API key
  const updateAccount = async () => {
    try {
      const url = `/server/user/updateAccount`;
      let dataToSend = {};

      // Compare initial and current states to determine what has changed
      if (userName !== userData.userData.username) {
        dataToSend.username = userName;
      }
      if (email !== userData.userData.email) {
        dataToSend.email = email;
      }
      if (bio !== userData.userData.bio) {
        dataToSend.bio = bio;
      }
      const response = await axios({
        method: 'POST',
        url,
        data: dataToSend
      })
      console.log(response);

      setSuccessMessage(`${response.data.message}`);
      //redirect back to the watchList page

    } catch (error) {
      setError(error);
      console.log(error);
    }

  };

  return (

    <div className="profileSplit">
      <h1>My Profile</h1>
      <div className="profileInfo">
        <h2>username : </h2> <input type="text" defaultValue={userData.userData.username} onChange={(e) => setUserName(e.target.value)} />
        <br />
        <h2>email : </h2> <input type="text" defaultValue={userData.userData.email} placeholder="Add an email here" onChange={(e) => setEmail(e.target.value)} />
        <br />
        {/* if bio exists its displayed, otherwise display message to add bio */}
        <h2>Bio : </h2><textarea placeholder='Add a bio here' onChange={(e) => setBio(e.target.value)} defaultValue={userData.userData.bio} />
        <button className="btn btn-primary" onClick={updateAccount}>Update Account </button>
        <br />
        {error ? (
          <span style={{ color: "red" }}>Error: {error.message} <br /> message : {error.response.data.error} </span>
        ) : successMessage ? (
          <span style={{ color: "green" }}>{successMessage}</span>
        ) : (
          <span />
        )}
      </div>
    </div>



  )
}

export default UserPin