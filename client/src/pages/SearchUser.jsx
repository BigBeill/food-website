// external imports
import React, {useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

// internal imports
import axios from "../api/axios";
import GrowingText from "../components/GrowingText";

export default function SearchUser() {

   const [searchParams, setSearchParams] = useSearchParams();
   const usernameContainer = useRef(null);

   const [_id, set_id] = useState(searchParams.get("_id") || "");
   const [username, setUsername] = useState(searchParams.get("username") || "");
   const [email, setEmail] = useState(searchParams.get("email") || "");

   const [users, setUsers] = useState([]);

   function submitSearch() {
      let params = {};
      if (_id) params._id = _id;
      if (username) params.username = username;
      if (email) params.email = email;
      setSearchParams(params);
      // the actual search will be done in useEffect if searchParams changes
   }

   useEffect (() => {
      let url = "user/find?limit=15";

      // add username and password to url
      if (username) url += `&username=${username}`;
      if (email) url += `&email=${email}`;

      // make axios call
      axios({
         method: 'get',
         url
      })
      .then((response) => {
         setUsers(response);
      })
   },[searchParams]);

   return (
      <div className="displayUserInformationCards">

         <div className="filterPanel">
            <h2>Filter users</h2>
            <div className="textInput">
               <label htmlFor="searchId">user ID</label>
               <input 
               id="searchId" 
               type="text"
               placeholder="Search by ID (exact match)"
               value={_id}
               onChange={(event) => set_id(event.target.value)}
               onKeyDown={ (event) => { if(event.key == "Enter") submitSearch(); } }
               />
            </div>
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

         { users.map((user, index) => (
            <div key={index} className="userInformationCard">
               <div ref={usernameContainer}>
                  <GrowingText text={user.username} parentDiv={usernameContainer} />
               </div>
               <div>
               </div>
               <div>
               </div>
               <div>
               </div>
            </div>
         ))}
      </div>
   );
}