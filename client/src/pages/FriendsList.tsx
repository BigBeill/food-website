// external imports
import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";

//internal imports
import axios from '../api/axios';
import UserPin from '../components/UserPin';
import Folder from '../components/Folder';

import FolderObject from '../interfaces/FolderObject';
import UserObject from '../interfaces/UserObject';
import PaginationBar from '../components/PaginationBar';

export default function FriendsList() {
   const [searchParams, setSearchParams] = useSearchParams();

   const pageSize: number = 15;

   const folderId: string = searchParams.get('folderId') || '';
   const pageNumber: number = Number(searchParams.get('pageNumber')) || 1;

   const [totalCount, setTotalCount] = useState<number>(0);

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

   function requestNewPage(page: number) {
      setUsers([]);
      document.getElementById("root")?.scrollTo({ top: 0, behavior: "auto" });
      setSearchParams(searchParams => ({...searchParams, pageNumber: page}));
      // the actual search will be done in useEffect if searchParams changes
   }

   useEffect(() => {
      let url: string = `/user/find?limit=${pageSize}&skip=${(pageNumber - 1) * pageSize}`;
      if (!folderId) { 
         url += `&relationship=1`;
         setFolders([{_id: "requests", content: []}]);
      }
      else if (folderId == "requests") { 
         url += `&relationship=2`; 
         setFolders([]);
      }
      else { 
         url += `&folderId=${folderId}`;
         setFolders([]);
      }
      if (username) { url += `&username=${username}`; }
      if (email) { url += `&email=${email}`; }

      axios({
         method: 'get',
         url
      })
      .then((response) => {
         setUsers(response.users);
         setTotalCount(response.totalCount);
      })
   }, [searchParams]);

   return (
      <div>
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
         <PaginationBar currentPage={pageNumber} totalPages={Math.ceil(totalCount / pageSize)} requestNewPage={requestNewPage} />
      </div>
   );
}
 