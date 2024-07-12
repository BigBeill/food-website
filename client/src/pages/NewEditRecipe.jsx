import React, { useState, useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import ActiveSearchBar from '../components/ActiveSearchBar'
import NoteBook from '../components/NoteBook'
import { Reorder } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { assignIds } from '../tools/general'

function NewEditRecipe ({userData}) {
  if (userData && userData._id == ""){ return <Navigate to='/login' />}

  const [searchParams] = useSearchParams()
  const recipeId = searchParams.get('recipeId')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  const [ingredientList, setIngredientList] = useState([])

  const [instructionList, setInstructionList] = useState([])

  useEffect (() => {
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
  ]

  return <NoteBook pageList={pageList} />
}

function GeneralInfoPage ({newRecipe, title, setTitle, description, setDescription}) {
  return (
    <>
      <h1>{newRecipe ? 'New Recipe' : 'Edit Recipe'}</h1>

      <div className='textInput center extraBottom'>
        <label htmlFor='title'>Title</label>
        <input id='title' type='text' value={title} onChange={(event) => setTitle(event.target.value)} placeholder='give your recipe a title'/>
      </div>

      <div className='textInput center'>
        <label htmlFor='description'>Description</label>
        <textarea id='description' rows="9" value={description} onChange={(event) => setDescription(event.target.value)} placeholder='describe your recipe' />
      </div>
    </>
  )
}

function ImagePage ({image, setImage}) {
  const imageOptions = ['🧀', '🥞', '🍗', '🍔','🍞', '🥯', '🥐','🥨','🍗','🥓','🥩','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🥚','🍳','🥘','🥣','🥗','🍿','🧂','🥫']
  return (
    <>
      <p>page two</p>
      <label htmlFor='image'>image</label>
      <select id='image' value={image} onChange={(event) => setImage(event.target.value)}>
        <option value="" disabled hidden>choose image</option>
        {imageOptions.map((option, index) => ( <option key={index}>{option}</option> ))}
      </select>
    </>
  )
}

function IngredientPage ({ingredientList, setIngredientList}) {
  const baseUnits = ['physical', 'milligrams', 'grams', 'pounds', 'ounces', 'liters', 'millimeters', 'cups', 'tablespoons']

  const [newIngredient, setNewIngredient] = useState({_id:"", name:"", unitType:[], unit:"", amount:""})
  const [availableId, setAvailableId] = useState(ingredientList.length)
  const [unitsAvailable, setUnitsAvailable] = useState(baseUnits)

  function addIngredient () {

  }

  return (
    <div className='pageContent'>
      <h2>Recipe Ingredients</h2>
      <Reorder.Group className='reorderList' axis='y' values={ingredientList} onReorder={setIngredientList}>
        {ingredientList.map((item) => (
          <Reorder.Item key={item.id} value={item}>
            {(item.content.unit == 'physical') ? (
              <p>{item.content.amount} {item.content.name}{item.content.amount!=1 ? 's' : ''}</p>
            ):(
            <p>{item.content.amount} {item.content.unit}{item.content.amount != 1 ? 's' : ''} of {item.content.name}</p>
            )}
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
          <input className='mainInput' placeholder='add ingredient'/>
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
      setInstructionList((list) => {return [...list, {
        id: availableId,
        content: newInstruction
      }]})
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
    <div className='pageContent'>
      <h2>Recipe Instructions</h2>
      <Reorder.Group className='reorderList noMargin' axis='y' values={instructionList} onReorder={setInstructionList}>
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

export default NewEditRecipe