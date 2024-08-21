function UserPin(userData) {




  return (

    <div className="profileSplit">
      <div className="profileInfo">
        <h1>username :</h1> <p>{userData.userData.username}</p>
        <br />
        <h1>email :</h1> <p> {userData.userData.email}</p>
        <br />
        {/* if bio exists its displayed, otherwise display message to add bio */}
        <p>{userData.userData.bio ? userData.userData.bio : 'Add a bio on edit account page'}</p>
      </div>
    </div>



  )
}

export default UserPin