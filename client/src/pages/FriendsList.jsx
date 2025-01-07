// external imports
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

// internal imports
import axios from "../api/axios";
import NoteBook from "../components/NoteBook"
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
               name: MainPage,
               props: { 
                  searchName,
                  setSearchName,
                  setSearchType
                }
            },
            {
               name: ListUsersPage,
               props: { usersList }
            }
         ]);
      })
      .catch((error) => {
         console.error(error);
      });
   }

   useEffect (() => { loadMainPage() }, [searchName, searchType]);

   function RequestNewPage(pageNumber) {

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
               name: ListUsersPage,
               props: { usersList: usersListSetOne }
            },
            {
               name: ListUsersPage,
               props: { usersList: usersListSetTwo }
            }
         ]);

      })
      .catch((error) => {
         console.error(error);
      });

   }

   return <NoteBook pageList={pageList} parentPageNumber={parentPageNumber} RequestNewPage={RequestNewPage} />
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

 