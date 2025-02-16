// external imports
import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from "react-router-dom";

//internal imports
import axios from '../api/axios';
import UserPin from '../components/UserPin';
import Folder from '../components/Folder';

import FolderObject from '../interfaces/FolderObject';
import UserObject from '../interfaces/UserObject';

export default function FriendsList() {

   const { folderId } = useParams();
   const [searchParams, setSearchParams] = useSearchParams();

   const [username, setUsername] = useState(searchParams.get('username') || '');
   const [email, setEmail] = useState(searchParams.get('email') || '');

   const [folders, setFolders] = useState<FolderObject[]>([]);
   const [users, setUsers] = useState<UserObject[]>([]);

   function submitSearch() {
      let params: { username?: string; email?: string; } = {};
      if (username) params.username = username;
      if (email) params.email = email;
      setSearchParams(params);
      // the actual search will be done in useEffect if searchParams changes
   }

   useEffect(() => {
      if(!folderId){
         axios({
            method: 'get',
            url: `/user/find?collection=1&limit=15&username=${username}&email=${email}`
         })
         .then((response) => {
            setFolders([{_id: "requests", content: []}]);
            setUsers(response.users);
         });
      }
      else if (folderId == "requests") {
         axios({
            method: 'get',
            url: `/user/find?collection=2&limit=15&username=${username}&email=${email}`
         })
         .then((response) => {
            setFolders([]);
            setUsers(response);
         });
      }
      else {
         console.log("still working on this code")
      }
   },[searchParams, folderId]);

   return (
      <div className='displayUserInformationCards'>
         <div className='filterPanel'>
            <h2>Filter Users - Friends</h2>
            <div className="textInput">
               <label htmlFor="searchUsername">Username</label>
               <input 
               id="searchUsername" 
               type="text"
               placeholder="Search by username"
               value={username}
               onChange={(event) => setUsername(event.target.value)}
               onKeyDown={ (event) => { if(event.key == "Enter") submitSearch(); } }
               />
            </div>
            <div className="textInput">
               <label htmlFor="searchEmail">Email</label>
               <input 
               id="searchEmail" 
               type="text"
               placeholder="Search by email"
               value={email}
               onChange={(event) => setEmail(event.target.value)}
               onKeyDown={ (event) => { if(event.key == "Enter") submitSearch(); } }
               />
            </div>
            <button 
            className="moveToBottom"
            onClick={() => submitSearch()}
            >
               Search
            </button>
         </div>

         {folders.map((folder, index) => ( 
            <Folder key={index} folderDetails={folder} />
         ))}

         { users.map((userData, index) => (
           <UserPin key={index} userData={userData} /> 
         ))}
      </div>
   )
}
 