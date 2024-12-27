import React, { useState, useEffect } from 'react';
import axios from "../api/axios";

import NoteBook from "../components/NoteBook"

export default function FriendsList(){

   const usersPerPage = 6;

   const [searchName, setSearchName] = useState("");
   const [ searchType, setSearchType ] = useState("viewAllAccounts");

   function changeSearchType (event) {
      console.log(event);
   }


   const [parentPageNumber, setParentPageNumber] = useState(0);

   const [pageList, setPageList] = useState([
      {
         name: MainPage,
         props: { changeSearchType }
      }
   ]);

   function loadMainPage() {
      setParentPageNumber(0);

      const url = searchName ? `user/find?username=${searchName}&limit=${usersPerPage}` : `user/find?limit=${usersPerPage}`;
      axios({ method:'get', url })
      .then((usersList) => {
         setPageList([
            {
               name: MainPage,
               props: { changeSearchType }
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

   useEffect (() => { loadMainPage() }, []);

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

      const url = searchName ? `user/find?username=${searchName}&limit=${usersPerPage * 2}&skip=${(pageNumber - 1) * usersPerPage}` : `user/find?limit=${usersPerPage * 2}&skip=${(pageNumber - 1) * usersPerPage}`;
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

function MainPage({ changeSearchType }) {
   return (
      <div>
         <div className='extraBottom'>
            <div className="radioContainer">
               <input type="radio" id="viewFriends" name="searchType" value="viewFriends" onChange={ (event) => changeSearchType(event) } />
               <label htmlFor="viewFriends">My Friends</label>
            </div>
            <div className="radioContainer">
               <input type="radio" id="viewFriendRequests" name="searchType" value="viewFriendRequests" onChange={ (event) => changeSearchType(event) } />
               <label htmlFor="viewFriendRequests">Friend Requests</label>
            </div>
            <div className="radioContainer">
               <input type="radio" id="findNewFriends" name="searchType" value="viewAllAccounts" onChange={ (event) => changeSearchType(event) } defaultChecked/>
               <label htmlFor="findNewFriends">All Accounts</label>
            </div>
         </div>

         <div className='textInput'>
            <label htmlFor="usernameInput">Search Username</label>
            <input id="usernameInput" type="text" placeholder='Enter username'/>
         </div>
      </div>
   )
}

function ListUsersPage({ usersList }) {
   return (
      <div className='noteBookPinContainer'>
         { usersList.map((listUser, index) => (
            <div key={index} className='noteBookPin'>
               <p>{listUser.username}</p>
            </div>
         ))}
      </div>
   )
}