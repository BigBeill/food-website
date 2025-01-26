import React, {useEffect, useState} from "react"

import axios from "../api/axios"
import UserPin from "./UserPin"

export default function Folder(friendRequestFolder, folderDetails) {

  const [displayUsers, setDisplayUsers] = useState([])

  useEffect(() => {
    if (!friendRequestFolder) {
      folderDetails.contents.slice(0, 3).forEach((userId) => {
        axios({ 
          method: 'get',
          url: `/user/info/${userId}`
        })
        .then((response) => {
          setDisplayUsers((prev) => [...prev, response])
        })
        .catch((error) => {
          console.error(error)
        })
      });
    }
    else {
      axios({
        method: 'GET',
        url: `/user/find?collection=2 limit=3`
      })
      .then((response) => {
        console.log(response)
        setDisplayUsers(response)
      })
      .catch((error) => {
        console.error(error)
      })
    }
  }, []);

  return (
   <div className="displayFolder">

      <div className="userCards shielded">
        { displayUsers[0] ? (
          <div className="cardContainer">
            <UserPin userData={displayUsers[0]} />
          </div>
        ) : null}
        { displayUsers[1] ? (
          <div className="cardContainer">
            <UserPin userData={displayUsers[1]} />
          </div>
        ) : null }
        { displayUsers[2] ? (
          <div className="cardContainer">
            <UserPin userData={displayUsers[2]} />
          </div>
        ) : null }

      </div>

   </div>
  )
}