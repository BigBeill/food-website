// external imports
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from "react-router-dom";

//internal imports
import axios from '../api/axios';
import UserPin from '../components/UserPin';
import Folder from '../components/Folder';

export default function FriendsList() {

   const { folderId } = useParams();
   const [searchParams, setSearchParams] = useSearchParams();

   const [username, setUsername] = useState(searchParams.get('username') || '');
   const [email, setEmail] = useState(searchParams.get('email') || '');

   const [folders, setFolders] = useState([]);
   const [users, setUsers] = useState([]);

   function submitSearch() {
      let params = {};
      if (username) params.username = username;
      if (email) params.email = email;
      setSearchParams(params);
      // the actual search will be done in useEffect if searchParams changes
   }

   useEffect(() => {
      if(!folderId){
         axios({
            method: 'GET',
            url: `/user/find?collection=1&limit=15&username=${username}&email=${email}`
         })
         .then((response) => {
            setFolders([{_id: "requests"}]);
            setUsers(response);
         });
      }
      else if (folderId == "requests") {
         axios({
            method: 'GET',
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

         {users.map((userData, index) => (
           <UserPin key={index} userData={userData} /> 
         ))}
      </div>
   )
}


/*
   ------------ Old Code ------------

// external imports
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

// internal imports
import axios from "../api/axios";
import Notebook from "../components/Notebook"
import UserNotebookPin from '../components/UserNotebookPin';


export default function FriendsList(){

   const usersPerPage = 6;

   const [searchName, setSearchName] = useState('');
   const [ searchType, setSearchType ] = useState(0);

   const [parentPageNumber, setParentPageNumber] = useState(0);

   const [pageList, setPageList] = useState([]);

   function loadMainPage() {
      setParentPageNumber(0);

      const url = searchName ? `user/find?username=${searchName}&limit=${usersPerPage}&collection=${searchType}` : `user/find?limit=${usersPerPage}&collection=${searchType}`;
      axios({ method:'get', url })
      .then((usersList) => {
         setPageList([
            {
               content: MainPage,
               props: { 
                  searchName,
                  setSearchName,
                  setSearchType
                }
            },
            {
               content: ListUsersPage,
               props: { usersList }
            }
         ]);
      })
      .catch((error) => {
         console.error(error);
      });
   }

   useEffect (() => { loadMainPage() }, [searchName, searchType]);

   function requestNewPage(pageNumber) {

      if (pageNumber < 0) {
         console.error("Page number cannot be less than 0");
         return;
      }

      if (pageNumber == 0) {
         loadMainPage();
         return;
      }

      setParentPageNumber(pageNumber);

      const url = searchName ? `user/find?username=${searchName}&limit=${usersPerPage * 2}&skip=${(pageNumber - 1) * usersPerPage}&collection=${searchType}` : `user/find?limit=${usersPerPage * 2}&skip=${(pageNumber - 1) * usersPerPage}&collection=${searchType}`;
      axios({ method:'get', url })
      .then((usersList) => {

         const usersListSetOne = usersList.slice(0, usersPerPage);
         const usersListSetTwo = usersList.slice(usersPerPage, usersList.length);

         setPageList([
            {
               content: ListUsersPage,
               props: { usersList: usersListSetOne }
            },
            {
               content: ListUsersPage,
               props: { usersList: usersListSetTwo }
            }
         ]);

      })
      .catch((error) => {
         console.error(error);
      });

   }

   return <Notebook pageList={pageList} parentPageNumber={parentPageNumber} requestNewPage={requestNewPage} />
}

function MainPage({ searchName, setSearchName, setSearchType }) {

   const [searchBar, setSearchBar] = useState(searchName);

   function searchUsername() {
      setSearchName(searchBar);
   }

   return (
      <div>
         <div className='extraBottom'>
            <div className="radioContainer">
               <input type="radio" id="viewFriends" name="searchType" value="1" onChange={ () => setSearchType(1) } />
               <label htmlFor="viewFriends">My Friends</label>
            </div>
            <div className="radioContainer">
               <input type="radio" id="viewFriendRequests" name="searchType" value="2" onChange={ () => setSearchType(2) } />
               <label htmlFor="viewFriendRequests">Friend Requests</label>
            </div>
            <div className="radioContainer">
               <input type="radio" id="findNewFriends" name="searchType" value="0" onChange={ () => setSearchType(0) } defaultChecked/>
               <label htmlFor="findNewFriends">All Accounts</label>
            </div>
         </div>

         <div className='textInput sideButton'>
            <div>
               <label htmlFor="usernameInput">Search Username</label>
               <input 
                  id="usernameInput"
                  type="text"
                  placeholder='Enter username'
                  value={searchBar}
                  onChange={ (event) => { setSearchBar(event.target.value) } }
                  onKeyDown={ (event) => { if (event.key === 'Enter') searchUsername() } }
               />
            </div>
            <div className='svgButtonContainer' onClick={ () => { searchUsername() } }>
               <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>
         </div>
      </div>
   )
}

function ListUsersPage({ usersList }) {
 
   return (
      <div className="pinContainer">
         {usersList.map((listUser, index) => (
            <UserNotebookPin key={index} userData={listUser} />
         ))}
     </div>
   );
}
*/
 