import React, { useState, useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import ActiveSearchBar from '../components/ActiveSearchBar'

function editRecipe () {
  const [recipeId, setRecipeId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const [ingredientList, setIngredientList] = useState([])
  const [newIngredient, setNewIngredient] = useState({name:"", _id:"", unitType:[], unit:"", amount:""})
  const [dropdownOptions, setDropdownOptions] = useState([])
  const [unitsAvailable, setUnitsAvailable] = useState({hidden:true, units:[]})

  const [instructionList, setInstructionList] = useState([])
  const [newInstruction, setNewInstruction] = useState("")

  const location = useLocation()
  const navigateTo = useNavigate()
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const queryId = queryParams.get('recipe')
    if (!queryId) { navigateTo("/editRecipe?recipe=new") }
    else { setRecipeId(queryId) }
  }, [])

  function fetchDropdownOptions(ingredientName, amount = 5) {
    fetch(`server/recipe/findIngredient?name=${encodeURIComponent(ingredientName)}&amount=${amount}`)
    .then(response => response.json())
    .then(data => {setDropdownOptions(data)})
    .catch(error => {console.error("Error fetching Recipes:", error)});
  }

  function ingredientNameChange(event) {
    if(event.type == "change"){ // text input was changed
      setNewIngredient({...newIngredient, name: event.target.value, _id: ""})
      setUnitsAvailable({hidden:true, units:[]})

      // Optionally, trigger the fetch only if the input length is sufficient
      if (event.target.value.length > 0) { fetchDropdownOptions(event.target.value) } 
      else { setDropdownOptions([]) }

    } else if(event.type == "click") { // button was clicked
      // find the option that was clicked inside dropdownOptions
      let optionData
      dropdownOptions.forEach(option => {
        if (option.name == event.target.value) { optionData = option }
      })

      // set all relavent data
      setNewIngredient({...newIngredient, name:optionData.name, _id:optionData._id, unitType:optionData.unitType})
      setDropdownOptions([])
      let units = []
      if (optionData.unitType.includes('weight')) { units.push('grams', 'pounds', 'ounces') }
      if (optionData.unitType.includes('physical')) { units.push('physical') }
      if (optionData.unitType.includes('volume')) { units.push('liters', 'milliters', 'cups', 'tablespoons')}
      setUnitsAvailable({hidden:false, units:units})
    }
  }

  function addIngredient() {
    //check for any missing data
    if (newIngredient.name == "" || newIngredient.amount == "" || newIngredient.unit == "" || newIngredient._id == ""){ return } 

    //if no data is missing add ingredient to list of ingredients
    setIngredientList((list) => { return [...list, newIngredient] })
  }

  function addInstruction() {
    if (newInstruction != ""){ setInstructionList((list) => { return [...list, newInstruction] }) }
  }

  function submitForm() {
    if (title == "" || description == "" || ingredientList.length == 0 || instructionList.length == 0){ return }
    const recipeData = {
      title: title,
      description: description,
      ingredients: ingredientList,
      instructions: instructionList
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
            rows="9"
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
                <p>{ingredient.amount} {ingredient.unit!='physical' ?  ingredient.unit +' of' : '' } {ingredient.name}{ingredient.amount!=1 ? 's' : ''}</p> 
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
            className={unitsAvailable.hidden ? 'hidden' : ''} //hide input if needed
            type='number'
            value={newIngredient.amount}
            onChange={(event) => setNewIngredient({...newIngredient, amount: event.target.value})}
            placeholder='Amount'/>
            <select 
            className={unitsAvailable.hidden ? 'hidden' : ''} //hide input if needed
            defaultValue={""}
            onChange={(event) => setNewIngredient({...newIngredient, unit: event.target.value})}>
              <option value="" disabled hidden>Units</option>
              {unitsAvailable.units.map((unit, index) => (
                <option key={index}>{unit}</option>
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
      <button onClick={submitForm}>submit</button>
    </div>
    </>
  )
}

export default editRecipe