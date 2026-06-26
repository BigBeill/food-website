import {useEffect, useState} from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

import UserPin from "./UserPin"

import { UserType, FolderType } from "../domain/user.types";
import { useRouter } from "next/router";
import { userService } from "../services/user.service";

interface FolderProps {
   folder: FolderType
}

export default function Folder({ folder }: FolderProps) {

   const router = useRouter();

   const [userList, setUserList] = useState<UserType[]>([])

   useEffect(() => {
      // fetch the first 3 users in the folder from server
      if (folder._id == "requests") {
         userService.search({
            category: 'incomingRequests',
            limit: 3,
         })
         .then((response) => { setUserList(response) })
         .catch((error) => { console.error(error) });
      }
      else {
         folder.content.slice(0, 3).forEach((user) => {
            userService.get(user._id)
            .then((response) => { setUserList((previous) => [...previous, response]) })
            .catch((error) => { console.error(error) });
         });
      }
   }, []);

   function openFolder() {
      if (folder._id == "requests") { router.push('/searchUser/requests'); }
      else { router.push(`/searchUser/friends/${folder._id}`); }
   }
   
   return (
      <div className="folderObjectView">

         <div className="userCards shielded">
         { userList[2] ? (
            <div className="cardContainer">
               <UserPin initialUser={userList[2]} />
            </div>
         ) : <div style={ {display: 'none'} }></div>}
         { userList[0] ? (
            <div className="cardContainer">
               <UserPin initialUser={userList[0]} />
            </div>
         ) : <div style={ {display: 'none'} }></div> }
         { userList[1] ? (
            <div className="cardContainer">
               <UserPin initialUser={userList[1]} />
            </div>
         ) : <div style={ {display: 'none'} }></div> }

         </div>
         
         <FontAwesomeIcon 
         className="folder" 
         icon={faFolder}
         onClick={ () => { openFolder() } }
         />

         <p className="folderCover"> Friend Requests </p>

      </div>
   )
}