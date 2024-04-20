import React, { useRef, useState, useEffect } from 'react'

function createRecipe () {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  return(
    <>
    <div className='formTypeA'>
      <h1>Your Recipe</h1>

      <div className='splitSpace'>
        <div>
          <div className='textInput'>
            <label htmlFor="title">Recipe Name</label>
            <input 
            type="text" 
            id="title"
            placeholder="Name your recipe" />
          </div>
          <div className='textInput'>
          <label htmlFor="description">Recipe Description</label>
            <textarea
            type="text" 
            id="description"
            rows="12"
            placeholder="Describe your recipe" />
          </div>
        </div>
        <div>

        </div>
      </div>
    </div>
    </>
  )
}

export default createRecipe