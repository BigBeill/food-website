
import axios from "../api/axios";

export default function Admin(){

   async function resetUsers () {
      try { await axios({ method: 'put', url: 'admin/resetUsers' }); }
      catch (error) { console.error(error); }
   }
   return (
      <div className="whiteBackground">
         <h1>Admin Page</h1>
         <button onClick={resetUsers}>Reset Users</button>
      </div>
   );
}