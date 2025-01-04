// external imports
import React from "react";

// internal imports
import axios from "../api/axios";

export default function Admin(){

   async function resetUsers () {
      await axios({ method: 'put', url: 'admin/resetUsers' })
      .catch(console.error);
   }
   return (
      <div className="whiteBackground">
         <h1>Admin Page</h1>
         <button onClick={resetUsers}>Reset Users</button>
      </div>
   );
}