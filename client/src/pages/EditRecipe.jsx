import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import NoteBook from '../components/NoteBook'
import { Reorder } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { assignIds, removeIds } from '../tools/general'

export default function NewEditRecipe ({userData}) {
  const navigate = useNavigate()

  if (userData && userData._id == ""){ return navigate('/login') }

  const [searchParams] = useSearchParams()
  const recipeId = searchParams.get('recipeId')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  const [ingredientList, setIngredientList] = useState([])

  const [instructionList, setInstructionList] = useState([])

  useEffect (() => {
    // if recipe exists, populate this page with recipes data from server
    if (recipeId) {
      fetch('/server/recipe/recipeData?_id=' + recipeId)
      .then (response => response.json())
      .then (data => {
        const recipeData = data.schema
        setTitle(recipeData.title)
        setDescription(recipeData.description)
        setImage(recipeData.image)
        setIngredientList(assignIds(recipeData.ingredients))
        setInstructionList(assignIds(recipeData.instructions))
      })
      .catch((error) => { console.error(error.message) })
    }
  },[])

  function submitRecipe(){
    let method
    if (!recipeId) { method = 'POST' }
    else { method = 'PUT' }

    const serverRequest = {
      method: method,
      headers: { 'Content-type': 'application/json; charset=UTF-8', },
      body: JSON.stringify({
        id: recipeId,
        title: title,
        description: description,
        image: image,
        ingredients: removeIds(ingredientList),
        instructions: removeIds(instructionList)
      })
    }
    fetch('/server/recipe/edit', serverRequest)
    .then((response) => {
      if (!response.ok) { throw new Error(`HTTP error, status: ${response.status}`) }
      navigate('/') 
    })
    .catch((error) => { console.error('server failed to save recipe:', error) })
  }

  const pageList = [
    {
      name: GeneralInfoPage,
      props: {
        newRecipe: !recipeId,
        title: title,
        setTitle: setTitle,
        description: description, 
        setDescription: setDescription,
      }
    },
    { 
      name: ImagePage,
      props: {
        image: image,
        setImage: setImage,
      }
    },
    { 
      name: IngredientPage,
      props: {
        ingredientList: ingredientList,
        setIngredientList: setIngredientList
      }
    },
    { 
      name: InstructionPage,
      props: {
        instructionList: instructionList,
        setInstructionList: setInstructionList
      }
    },
    {
      name: SubmissionPage,
      props: {
        submitRecipe: submitRecipe
      }
    }
  ]

  return <NoteBook pageList={pageList} />
}

function GeneralInfoPage ({newRecipe, title, setTitle, description, setDescription}) {
  return (
    <div className='standardPage'>
      <h1>{newRecipe ? 'New Recipe' : 'Edit Recipe'}</h1>

      <div className='textInput center extraBottom'>
        <label htmlFor='title'>Title</label>
        <input id='title' type='text' value={title} onChange={(event) => setTitle(event.target.value)} placeholder='give your recipe a title'/>
      </div>

      <div className='textInput center'>
        <label htmlFor='description'>Description</label>
        <textarea id='description' rows="9" value={description} onChange={(event) => setDescription(event.target.value)} placeholder='describe your recipe' />
      </div>
    </div>
  )
}

function ImagePage ({image, setImage}) {
  const imageOptions = ['🧀', '🥞', '🍗', '🍔','🍞', '🥯', '🥐','🥨','🍗','🥓','🥩','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🥚','🍳','🥘','🥣','🥗','🍿','🧂','🥫']
  return (
    <div className='standardPage'>
      <p>page two</p>
      <label htmlFor='image'>image</label>
      <select id='image' value={image} onChange={(event) => setImage(event.target.value)}>
        <option value="" disabled hidden>choose image</option>
        {imageOptions.map((option, index) => ( <option key={index}>{option}</option> ))}
      </select>
    </div>
  )
}

function IngredientPage ({ingredientList, setIngredientList}) {
  const baseUnits = ['physical', 'milligrams', 'grams', 'pounds', 'ounces', 'liters', 'millimeters', 'cups', 'tablespoons']

  const [newIngredient, setNewIngredient] = useState({_id:"", name:"", unit:"", amount:""})
  const [unitsAvailable, setUnitsAvailable] = useState(baseUnits)
  const [ingredientsAvailable, setIngredientsAvailable] = useState([])
  const [availableId, setAvailableId] = useState(ingredientList.length)

  function addIngredient () {
    //make sure important information is provided
    if(!newIngredient.name || !newIngredient.unit || !newIngredient.amount) { return }
    else if (!newIngredient._id) {
      // if _id is not known, attempt to find it in the database by name
      fetch(`/server/recipe/getIngredient?name=${newIngredient.name}`)
      .then(response => response.json())
      .then(data => {
        //if ingredient with name found, make sure data lines up with know information
        if (!data) { return }
        let units = []
        if (data.unitType.includes('weight')) { units.push('milligrams', 'grams', 'pounds', 'ounces') }
        if (data.unitType.includes('physical')) { units.push('physical') }
        if (data.unitType.includes('volume')) { units.push('liters', 'millimeters', 'cups', 'tablespoons') }
        if (!units.includes(newIngredient.unit)) { return }
        // if nothing is incorrect, save _id
        setNewIngredient({...newIngredient, _id:data._id})
      })
      .catch(error => {console.error("Error fetching ingredient:", error)});
      
      // if _id id still unknown, end function
      if (!newIngredient._id) {return}
    }

    // save new ingredient to ingredientList
    setIngredientList(list => [...list, {
      id: availableId,
      content: newIngredient
    }])
    setAvailableId(availableId+1)
    setNewIngredient({_id:"", name:"", unit:"", amount:""})
  }

  function removeIngredient (index) {
    let tempArray = ingredientList.slice()
    tempArray.splice(index, 1)
    setIngredientList(tempArray)
  }

  function ingredientNameChange(value) {
    setNewIngredient({...newIngredient, _id:'', name:value})
    setUnitsAvailable(baseUnits)
    if (value.length >= 3) {
      fetch(`server/recipe/findIngredient?name=${value}&amount=5`)
      .then(response => response.json())
      .then(setIngredientsAvailable)
      .catch(error => {console.error("Error fetching ingredients:", error)});
    }
    else { setIngredientsAvailable([]) }
  }

  function ingredientSelected (name, _id, unitType) {
    let units = []
    if (unitType.includes('weight')) { units.push('milligrams', 'grams', 'pounds', 'ounces') }
    if (unitType.includes('physical')) { units.push('physical') }
    if (unitType.includes('volume')) { units.push('liters', 'millimeters', 'cups', 'tablespoons') }
    setNewIngredient({...newIngredient, _id:_id, name:name})
    if (!units.includes(newIngredient.unit)) { setNewIngredient({...newIngredient, unit:'' }) }
    setUnitsAvailable(units)
    setIngredientsAvailable([])
  }

  return (
    <div className='standardPage'>
      <h2>Recipe Ingredients</h2>
      <Reorder.Group className='itemList' axis='y' values={ingredientList} onReorder={setIngredientList}>
        {ingredientList.map((item, index) => (
          <Reorder.Item key={item.id} value={item} className='listItem'>
            <div className='itemOptions'>
              <FontAwesomeIcon icon={faCircleXmark} style={{color: "#575757",}} onClick={() => removeIngredient(index)} />
            </div>
            <div className='itemContent'>
              {(item.content.unit == 'physical') ? (
                <p>{item.content.amount} {item.content.name}{item.content.amount != 1 ? 's' : ''}</p>
              ):(
              <p>{item.content.amount} {item.content.unit}{item.content.amount != 1 ? 's' : ''} of {item.content.name}</p>
              )}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <div className='textInput shared'>
        <label>New Ingredient</label>
        <div className='inputs'>
          <input type='number' value={newIngredient.amount} onChange={(event) => setNewIngredient({...newIngredient, amount: event.target.value})} placeholder='Amount'/>
          <select value={newIngredient.unit} onChange={(event) => setNewIngredient({...newIngredient, unit: event.target.value})}>
            <option value="" disabled hidden className='light'>Units</option>
            {unitsAvailable.map((unit, index) => (
              <option key={index}>{unit}</option>
            ))}
          </select>
          <div className='activeSearchBar'>
            <input type='text' className='mainInput' value={newIngredient.name} onChange={(event) => ingredientNameChange(event.target.value)} placeholder='Ingredient Name'/>
            <ul className={`${ingredientsAvailable.length == 0 ? 'hidden' : ''}`}>
              {ingredientsAvailable.map(ingredient => (
                <li key={ingredient._id} type='button' value={ingredient.name} onClick={(event) => ingredientSelected(ingredient.name, ingredient._id, ingredient.unitType)}> {ingredient.name} </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <button onClick={() => addIngredient()}>Add Ingredient</button>
    </div>
  )
}

function InstructionPage ({instructionList, setInstructionList}) {
  const [newInstruction, setNewInstruction] = useState('')
  const [availableId, setAvailableId] = useState(instructionList.length)

  function addInstruction() {
    if(newInstruction.length != 0){
      setInstructionList(list => [...list, {
        id: availableId,
        content: newInstruction
      }])
      setAvailableId(availableId+1)
      setNewInstruction('')
    }
  }

  function removeInstruction(index){
    let tempArray = instructionList.slice()
    tempArray.splice(index, 1)
    setInstructionList(tempArray)
  }

  return (
    <div className='standardPage'>
      <h2>Recipe Instructions</h2>
      <Reorder.Group className='itemList noMargin' axis='y' values={instructionList} onReorder={setInstructionList}>
        {instructionList.map((item, index) => (
          <Reorder.Item key={item.id} value={item} className='listItem'>
            <div className='itemContent'>
              <h4>Step {index + 1} </h4>
              <p>{item.content}</p>
            </div>
            <div className='itemOptions extraMargin'>
              <FontAwesomeIcon icon={faTrash} style={{color: "#575757",}} onClick={() => removeInstruction(index)} />
              <FontAwesomeIcon icon={faPen} style={{color: "#575757",}} />
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div className='textInput'>
        <label htmlFor='newInstruction'>New Instruction</label>
        <textarea id="newInstruction" rows='6' value={newInstruction} onChange={(event) => {setNewInstruction(event.target.value)}} placeholder='add a new instruction'/>
      </div>
      <button onClick={() => addInstruction()}>Add Instruction</button>
    </div>
  )
}

function SubmissionPage({submitRecipe}) {
  return (
    <>
      <h2>Save Recipe</h2>
      <button onClick={() => submitRecipe()}>Save recipe</button>
    </>
  )
}