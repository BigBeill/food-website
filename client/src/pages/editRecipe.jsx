import React, { useRef, useState, useEffect } from 'react'

function createRecipe () {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [instructionList, setInstructionList] = useState([])
  const [newInstruction, setNewInstruction] = useState("")

  function addIngredient() {

  }

  function addInstruction() {
    setInstructionList((list) => {
      return [...list, newInstruction]
    })
  }

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
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Name your recipe" />
          </div>
          <div className='textInput'>
            <label htmlFor="description">Recipe Description</label>
            <textarea
            type="text" 
            id="description"
            rows="12"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your recipe" />
          </div>
        </div>
        <div>
          <h2>image</h2>
        </div>
      </div>
      <div className='splitSpace'>
        <div>
          <h2>Ingredients</h2>
          <button
          name="addIngredient"
          id="addIngredientButton"
          className="addItemButton"
          onClick={addIngredient}
          >+</button>
        </div>
        <div>
          <h2>Instructions</h2>
          <div>
            {instructionList.map((instruction, index) => (
              <>
              <h4>Step {index + 1}</h4>
              <p>{instruction}</p>
              </>
            ))}
          </div>
          <div className="textInput withButton">
            <label htmlFor="newInstruction"><h3>new step</h3></label>
            <textarea
            type="text" 
            id="newInstruction"
            rows="3"
            value={newInstruction}
            onChange={(event) => setNewInstruction(event.target.value)}
            placeholder="Add instruction" />
            <button
            name="addInstruction"
            id="addInstructionButton"
            className="addItemButton"
            onClick={addInstruction}
            >+</button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default createRecipe