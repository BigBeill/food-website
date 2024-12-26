import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from "../api/axios";

import NoteBook from "../components/NoteBook"

export default function FriendsList(){

   const usersPerPage = 6;

   const [searchParams] = useSearchParams();
   const searchName = searchParams.get('searchName');

   const [parentPageNumber, setParentPageNumber] = useState(0);

   const [pageList, setPageList] = useState([
      {
         name: MainPage,
         props: {}
      }
   ]);

   function loadMainPage() {
      const url = searchName ? `user/find?username=${searchName}&limit=${usersPerPage}` : `user/find?limit=${usersPerPage}`;
      axios({ method:'get', url })
      .then((usersList) => {

         setPageList([
            {
               name: MainPage,
               props: {}
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

   useEffect (() => { loadMainPage() }, [searchParams]);

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

function MainPage() {
   return (
      <div>
         <div className="radioContainer">
            <input type="radio" id="viewFriends" name="searchType" value="viewFriends"></input>
            <label htmlFor="viewFriends">My Friends</label>
         </div>
         <div className="radioContainer">
            <input type="radio" id="viewFriendRequests" name="searchType" value="viewFriendRequests"></input>
            <label htmlFor="viewFriendRequests">Friend Requests</label>
         </div>
         <div className="radioContainer">
            <input type="radio" id="findNewFriends" name="searchType" value="findNewFriends"></input>
            <label htmlFor="findNewFriends">Add New Friends</label>
         </div>
      </div>
   )
}

function ListUsersPage({ usersList }) {
   return (
      <div>
         { usersList.map((listUser, index) => (
               <div key={index} ><p>{listUser.username}</p></div>
         ))}
      </div>
   )
}