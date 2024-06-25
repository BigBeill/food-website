import React, { useState, useEffect, useRef} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import ActiveSearchBar from '../components/ActiveSearchBar'

function newEditRecipe () {
  const [displayRight, setDisplayRight] = useState(false)

  return(
    <div className={`notebook ${displayRight ? 'displayRight' : ''}`}>
      <div className='notebookPage' onClick={() => setDisplayRight(false)}> 
        <h1>Edit Your Recipe</h1>

      </div>
      <img className="notebookSpine" src="/notebookSpine.png" alt="notebookSpine" />
      <div className='notebookPage' onClick={() => setDisplayRight(true)}>

        <label for="userImage"> Recipe Image </label>
        <input name="userImage" type="file"/>

      </div>
    </div>
  )
}

export default newEditRecipe