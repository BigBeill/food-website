import React, { useState } from 'react'
import ActiveSearchBar from '../components/ActiveSearchBar'

function editRecipe () {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const [ingredientList, setIngredientList] = useState([])
  const [newIngredient, setNewIngredient] = useState({name: "", _id: "", unit: "", amount: ""})
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

  function fetchIngredientData(ingredientName, amount = 5) {
    const url = `server/recipe/findIngredient?name=${encodeURIComponent(ingredientName)}&amount=${amount}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
      setDropdownOptions(data);
    })
    .catch(error => {
      console.error("Error fetching Recipes:", error);
    });
  }

  function ingredientNameChange(event) {
    if(event.type == "change"){ // text input was changed
      setNewIngredient({...newIngredient, name: event.target.value, _id: ""});
      if (event.target.value.length > 0) {  // Optionally, trigger the fetch only if the input length is sufficient
        fetchIngredientData(event.target.value);
      } else {
        setDropdownOptions([])
      }
    } else if(event.type == "click") { // button was clicked
      setNewIngredient({...newIngredient, name: event.target.value, _id: event.target.id})
      setDropdownOptions([])
    }
  }

  function addIngredient() {
    //check for any missing data
    if (newIngredient.name == "" || newIngredient.amount == "" || newIngredient.unit == ""){
      return
    } else if (newIngredient._id == ""){
      // attempt to find newIngredient._id if missing
      fetch (`server/recipe/findIngredient?name=${encodeURIComponent(newIngredient.name)}&amount=1`)
      .then((response) => response.json())
      .then((data) => {
        const dataIngredient = data[0]
        if (!dataIngredient){ return }
        else if (newIngredient.name != dataIngredient.name){ return }
        else { 
          // if able to be resolved, add _id to new ingredient and post recipe
          newIngredient._id = dataIngredient._id
          setIngredientList((list) => {
            return [...list, newIngredient]
          })
        }
      })
    } else {
      //if no data is missing add ingredient to list of ingredients
      setIngredientList((list) => {
        return [...list, newIngredient]
      })
    }
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
          <ul>
          {ingredientList.map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount} {ingredient.unit} of {ingredient.name} 
                <button onClick={() => {
                  var newList = [...ingredientList]
                  newList.splice(index, 1)
                  setIngredientList(newList)
                }}> - </button>
              </li>
            ))}
          </ul>
          <div className='newIngredientDiv'>
            <h3>New Ingredient</h3>
            <input 
            type='number'
            value={newIngredient.amount}
            onChange={(event) => setNewIngredient({...newIngredient, amount: event.target.value})}
            placeholder='Amount'/>
            <select 
            defaultValue={""}
            onChange={(event) => setNewIngredient({...newIngredient, unit: event.target.value})}>
              <option value="" disabled hidden>Units</option>
              {defaultUnits.map((unit, index) => (
                <option key={index}>{unit.full}</option>
              ))}
            </select>
            <ActiveSearchBar currentValue={newIngredient.name} options={dropdownOptions} eventHandler={ingredientNameChange} />
            
          </div>
          <button
          name="addIngredient"
          id="addIngredientButton"
          className="addItemButton"
          onClick={addIngredient}
          >+</button>
        </div>

        {/* div for user to input recipe instructions */}
        <div>
          <h2>Instructions</h2>
          <div>
            {instructionList.map((instruction, index) => (
              <>
              <h4>Step {index + 1}</h4>
              <p>{instruction}</p>
              <button onClick={() => {
                  var newList = [...instructionList]
                  newList.splice(index, 1)
                  setInstructionList(newList)
              }}> - </button>
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