import React from "react";
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