import React, { useEffect, useRef, useState } from 'react';
import GrowingText from '../components/growingText'

function recipeBook({recipeList}) {
  const titleContainer = useRef(null)
  const [displayRight, setDisplayRight] = useState(false)

  return(
    <div className={`notebook ${displayRight ? 'displayRight' : ''}`}>
      <div className='notebookPage' onClick={() => setDisplayRight(false)}>

        <div className='recipeContainer'>
         {recipeList.map((recipe, index) => (
            <div key={index} className='notebookRecipe'>
              <div className='recipeTitle' ref={titleContainer}>
                <GrowingText text={recipe.title} parentDiv={titleContainer}/>
              </div>
              <p className='image'>{recipe.image}</p>
            </div>
         ))}
        </div>  

      </div>
      <img className="notebookSpine" src="/notebookSpine.png" alt="notebookSpine" />
      <div className='notebookPage' onClick={() => setDisplayRight(true)}>
         
      </div>
    </div>
  )
}

export default recipeBook