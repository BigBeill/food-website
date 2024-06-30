import React, { useState, useEffect, useRef, Component} from 'react'
import { useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import ActiveSearchBar from '../components/ActiveSearchBar'
import NoteBook from '../components/NoteBook';
import editRecipe from './EditRecipe';

function newEditRecipe ({userData}) {
  if (userData._id == ""){ return <Navigate to='/login' />}

  const [searchParams] = useSearchParams()
  const recipeId = searchParams.get('recipeId')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  const [instructionList, setInstructionList] = useState([])

  useEffect (() => {
    fetch('server/recipe/recipeData?_id=' + recipeId)
    .then ((response) => {
      console.log(response)
      if (!response.ok) { throw new Error('Network response was not ok') }
      return response.json()
    })
    .then ((data) => {
      const recipeData = data.schema
      setTitle(recipeData.title)
      setDescription(recipeData.description)
      setImage(recipeData.image)
      setInstructionList(recipeData.instructions)
    })
    .catch((error) => { console.error(error.message) })
  },[])
  
  const pageList = [
    {
      name: GeneralInfo,
      props: {
        newRecipe: !recipeId,
        title: [title, setTitle],
        description: [description, setDescription],
      }
    },
    { 
      name: RecipeImage,
      props: {
        image: [image, setImage],
      }
    },
    { 
      name: Page3,
      props: {
        
      }
    },
    { 
      name: Page4,
      props: {
        instructionList: [instructionList, setInstructionList],
      }
    },
  ]

  return <NoteBook pageList={pageList}/>
}

function GeneralInfo ({newRecipe, title, description}) {
  return (
    <>
      <h1>{newRecipe ? 'New Recipe' : 'Edit Recipe'}</h1>

      <div className='textInput center extraBottom'>
        <label htmlFor='title'>Title</label>
        <input id='title' type='text' value={title[0]} onChange={(event) => title[1](event.target.value)} placeholder='give your recipe a title'/>
      </div>

      <div className='textInput center'>
        <label htmlFor='description'>Description</label>
        <textarea id='description' rows="9" value={description[0]} onChange={(event) => description[1](event.target.value)} placeholder='describe your recipe' />
      </div>
    </>
  )
}

function RecipeImage ({image}) {
  const imageOptions = ['🧀', '🥞', '🍗', '🍔','🍞', '🥯', '🥐','🥨','🍗','🥓','🥩','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🥚','🍳','🥘','🥣','🥗','🍿','🧂','🥫']
  return (
    <>
      <p>page two</p>
      <label htmlFor='image'>image</label>
      <select id='image' value={image[0]} onChange={(event) => image[1](event.target.value)}>
        <option value="" disabled hidden>choose image</option>
        {imageOptions.map((option, index) => ( <option key={index}>{option}</option> ))}
      </select>
    </>
  )
}

function Page3 () {
  return (
    <>
      <div className='halfVerticalSpace'>
        <h2>Recipe Ingredients</h2>

      </div>
      <div className='textInput'>
        <label>New Instruction</label>
        <input  placeholder='add ingredient'/>
      </div>
    </>
  )
}

function Page4 ({instructionList}) {
  const [newInstruction, setNewInstruction] = useState('')

  function addInstruction() {
    if(newInstruction.length != 0){
      instructionList[1]((list) => {return [...list, newInstruction]})
      setNewInstruction('')
    }
  }

  return (
    <>
      <div className='halfVerticalSpace'>
        <h2>Recipe Instructions</h2>
      </div>
      <div className='textInput'>
        <label htmlFor='newInstruction'>New Instruction</label>
        <textarea id="newInstruction" rows='6' value={newInstruction} onChange={(event) => {setNewInstruction(event.target.value)}} placeholder='add a new instruction'/>
      </div>
      <button onClick={addInstruction()}>Add Instruction</button>
    </>
  )
}

export default newEditRecipe