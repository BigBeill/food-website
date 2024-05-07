import React, { useRef, useState, useEffect } from 'react'

function IngredientInput(props) {
  const {options, changeHandler, name} = props 
  return (
    <div className='ingredientInput'>
      <input 
      type='text'
      value={name}
      onChange={changeHandler}
      placeholder='Ingredient Name'/>
    </div>
  )
}

function editRecipe () {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const [ingredientList, setIngredientList] = useState([])
  const [newIngredientAmount, setNewIngredientAmount] = useState("")
  const [newIngredientUnit, setNewIngredientUnit] = useState("")
  const [newIngredientName, setNewIngredientName] = useState("")
  const [dropdownOptions, setDropdownOptions] = useState([])

  const [instructionList, setInstructionList] = useState([])
  const [newInstruction, setNewInstruction] = useState("")

  const defaultUnits = [
    {full: 'milliliters', short: 'mL'},
    {full: 'liters', short: 'L'},
    {full: 'teaspoons', short: 'tsp'},
    {full: 'tablespoons', short: 'tbsp'},
    {full: 'cups', short: 'c'},
    {full: 'grams', short: 'g'},
    {full: 'ounces', short: 'oz'},
  ]

  function ingredientNameChange(event) {
    setNewIngredientName(event.target.value)
    const getRequest
  }

  function addIngredient() {

  }

  function addInstruction() {
    if (newInstruction != ""){
      setInstructionList((list) => {
        return [...list, newInstruction]
      })
    }
  }

  return(
    <>
    <div className='formTypeA'>
      <h1>Your Recipe</h1>

      <div className='splitSpace'>
        
        {/*div for user to input recipe name and details*/}
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

        {/* div for user to input recipe image */}
        <div>
          <h2>image</h2>
        </div>
      </div>



      <div className='splitSpace'>

        {/* div for user to input recipe ingredients */}
        <div>
          <h2>Ingredients</h2>
          <div className='newIngredientDiv'>
            <h3>New Ingredient</h3>
            <div>
              <input 
              type='number'
              value={newIngredientAmount}
              onChange={(event) => setNewIngredientAmount(event.target.value)}
              placeholder='Amount'/>
              <select 
              defaultValue={""}
              onChange={(event) => setNewIngredientUnit(event.target.value)}>
                <option value="" disabled hidden>Units</option>
                {defaultUnits.map((unit, index) => (
                  <option key={index}>{unit.full}</option>
                ))}
              </select>
              <IngredientInput options={dropdownOptions} changeHandler={ingredientNameChange} name={newIngredientName} />
            </div>
          </div>
          <button
          name="addIngredient"
          id="addIngredientButton"
          className="addItemButton"
          onClick={addIngredient}
          >+</button>
        </div>

        {/* div for user to inpue recipe instructions */}
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

export default editRecipe