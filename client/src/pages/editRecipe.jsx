import React, { useState, useEffect, useRef} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import ActiveSearchBar from '../components/ActiveSearchBar'

function editRecipe () {
  const errorRef = useRef()
  const [errorMessage, setErrorMessage] = useState("")

  const [recipeId, setRecipeId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const [chosenImage, setChosenImage] = useState("")
  const imageOptions = ['🧀', '🥞', '🍗', '🍔','🍞', '🥯', '🥐','🥨','🍗','🥓','🥩','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🥚','🍳','🥘','🥣','🥗','🍿','🧂','🥫']

  const [ingredientList, setIngredientList] = useState([])
  const [newIngredient, setNewIngredient] = useState({_id:"", name:"", unitType:[], unit:"", amount:""})
  const [dropdownOptions, setDropdownOptions] = useState([])
  const [unitsAvailable, setUnitsAvailable] = useState({hidden:true, units:[]})

  const [instructionList, setInstructionList] = useState([])
  const [newInstruction, setNewInstruction] = useState("")

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const queryId = queryParams.get('recipe')
    if (!queryId) { navigate("/editRecipe?recipe=new") }
    else { setRecipeId(queryId) }
  }, [])

  useEffect(() => {
    setErrorMessage("")
  }, [title, description, chosenImage, ingredientList, instructionList])

  function fetchDropdownOptions(ingredientName, amount = 5) {
    fetch(`server/recipe/findIngredient?name=${encodeURIComponent(ingredientName)}&amount=${amount}`)
    .then(response => response.json())
    .then(data => {setDropdownOptions(data)})
    .catch(error => {console.error("Error fetching Recipes:", error)});
  }

  function ingredientNameChange(event) {
    if(event.type == "change"){ // text input was changed
      setNewIngredient({...newIngredient, _id: "", name: event.target.value })
      setUnitsAvailable({hidden:true, units:[]})

      // Optionally, trigger the fetch only if the input length is sufficient
      if (event.target.value.length >= 3) { fetchDropdownOptions(event.target.value) } 
      else { setDropdownOptions([]) }

    } else if(event.type == "click") { // button was clicked
      // find the option that was clicked inside dropdownOptions
      let optionData
      dropdownOptions.forEach(option => {
        if (option.name == event.target.value) { optionData = option }
      })

      // set all relavent data
      setNewIngredient({_id:optionData._id, name:optionData.name, unitType:optionData.unitType, unit:"", amount:""})
      setDropdownOptions([])
      let units = []
      if (optionData.unitType.includes('weight')) { units.push('milligrams', 'grams', 'pounds', 'ounces') }
      if (optionData.unitType.includes('physical')) { units.push('physical') }
      if (optionData.unitType.includes('volume')) { units.push('liters', 'millimeters', 'cups', 'tablespoons') }
      setUnitsAvailable({hidden:false, units:units})
    }
  }

  function addIngredient() {
    //check for any missing data
    if (newIngredient.name == "" || newIngredient.amount == "" || newIngredient.unit == "" || newIngredient._id == ""){ return } 
    // remove the last letter from unit type if its an s
    let unitString = newIngredient.unit
    if (unitString.charAt(unitString.length - 1) == "s") { unitString = unitString.slice(0, -1) }
    //if no data is missing add ingredient to list of ingredients
    setIngredientList((list) => { return [...list, {...newIngredient, unit: unitString}]})
    setNewIngredient({_id:"", name:"", unitType:[], unit:"", amount:""})
    setUnitsAvailable({hidden:true, units:[]})
  }

  function addInstruction() {
    if (newInstruction == ""){ return }
    setInstructionList((list) => { return [...list, newInstruction] })
    setNewInstruction("")
  }

  function submitForm() {
    if (title == "" || description == "" || chosenImage == "" || ingredientList.length == 0 || instructionList.length == 0){ return }
    let newIngredientList = []
    for (const ingredient of ingredientList){ newIngredientList.push( delete ingredient.unitType) }
    const postRequest = {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8', },
      body: JSON.stringify({
        _id: recipeId,
        title: title,
        description: description,
        image: chosenImage,
        ingredients: ingredientList,
        instructions: instructionList
      })
    }

    fetch("server/recipe/updateRecipe", postRequest)
    .then(response => response.json())
    .then((data => {
      if (data.message == "success") { navigate("/")}
      else {setErrorMessage(data.message)}
    }))
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
          <label
          htmlFor='image'
          >image</label>
          <select 
          name='image'
          value={chosenImage}
          onChange={(event) => setChosenImage(event.target.value)}>
            <option value="" disabled hidden>choose image</option>
            {imageOptions.map((image, index) => (
              <option key={index}>{image}</option>
            ))}
          </select>
        </div>
      </div>



      <div className='splitSpace'>

        {/* div for user to input recipe ingredients */}
        <div>
          <h2>Ingredients</h2>
          <ul>
          {ingredientList.map((ingredient, index) => {
            if (ingredient.unit == 'physical') { return (
              <li key={index}>
                <p>{ingredient.amount} {ingredient.name}{ingredient.amount!=1 ? 's' : ''}</p>
              </li>
            )} else { return (
              <li key={index}>
                <p>{ingredient.amount} {ingredient.unit}{ingredient.amount != 1 ? 's' : ''} of {ingredient.name}</p>
              </li>
            )}
          })}
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
            value={newIngredient.unit}
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
              <React.Fragment key={index}>
              <h4>Step {index + 1}</h4>
              <p>{instruction}</p>
              <button onClick={() => {
                var newList = [...instructionList]
                newList.splice(index, 1)
                setInstructionList(newList)
              }}> - </button>
              </React.Fragment>
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

      <p ref={errorRef} className={errorMessage ? "error" : "hidden"} area-live="assertive">{errorMessage}</p>
    </div>
    </>
  )
}

export default editRecipe