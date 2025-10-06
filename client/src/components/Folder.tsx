import {useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

import axios from "../api/axios"
import UserPin from "./UserPin"

import FolderObject from "../interfaces/FolderObject";
import UserObject from "../interfaces/UserObject";

interface FolderProps {
   folderDetails: FolderObject
}

export default function Folder({ folderDetails }: FolderProps) {

   const navigate = useNavigate();

   const [displayUsers, setDisplayUsers] = useState<UserObject[]>([])

   useEffect(() => {
      // fetch the first 3 users in the folder from server
      if (folderDetails._id == "requests") {
         axios({ method: 'get', url: `/user/find?category=requests&limit=3` })
            .then((response) => { setDisplayUsers(response.userObjectArray) })
            .catch((error) => { console.error(error) });
      }
      else {
         folderDetails.content.slice(0, 3).forEach((userId) => {
            axios({ method: 'get', url: `/user/getObject/${userId}` })
               .then((response) => { setDisplayUsers((prev) => [...prev, response]) })
               .catch((error) => { console.error(error) });
         });
      }
   }, []);

   function openFolder() {
      if (folderDetails._id == "requests") { navigate('/searchUser/requests'); }
      else { navigate(`/searchUser/friends/${folderDetails._id}`); }
   }
   
   return (
      <div className="folderObjectView">

         {/* this is visual stuff, not useful to screen readers*/}
         <div className="userCards shielded" aria-hidden="true">
            { displayUsers[2] ? (
               <div className="cardContainer">
                  <UserPin userObject={displayUsers[2]} />
               </div>
            ) : <div style={ {display: 'none'} }></div>}
            { displayUsers[0] ? (
               <div className="cardContainer">
                  <UserPin userObject={displayUsers[0]} />
               </div>
            ) : <div style={ {display: 'none'} }></div> }
            { displayUsers[1] ? (
               <div className="cardContainer">
                  <UserPin userObject={displayUsers[1]} />
               </div>
            ) : <div style={ {display: 'none'} }></div> }
         </div>
         
         <FontAwesomeIcon 
            icon={faFolder}
            className="folder" 
            aria-hidden="true"
            onClick={ () => { openFolder() } }
         />

         <p className="folderCover" aria-label="Friend requests folder"> Friend Requests </p>

      </div>
   )
}