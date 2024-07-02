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
      console.log(data)
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

function GeneralInfo ({newRecipe, title, setTitle, description, setDescription}) {
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

function IngredientPage () {
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

function InstructionPage ({instructionList, setInstructionList}) {
  const [newInstruction, setNewInstruction] = useState('')

  function addInstruction() {
    if(newInstruction.length != 0){
      setInstructionList((list) => {return [...list, newInstruction]})
      setNewInstruction('')
    }
  }

  return (
    <div className='pageContent'>
        <h2>Recipe Instructions</h2>
        <div className='listContents'>
          { instructionList.map((instruction, index) => (
            <React.Fragment key={index}>
              <h4>Step {index + 1}</h4>
              <p>{instruction}</p>
            </React.Fragment>
          ))}
        </div>
      <div className='textInput'>
        <label htmlFor='newInstruction'>New Instruction</label>
        <textarea id="newInstruction" rows='6' value={newInstruction} onChange={(event) => {setNewInstruction(event.target.value)}} placeholder='add a new instruction'/>
      </div>
      <button onClick={addInstruction()}>Add Instruction</button>
    </div>
  )
}

export default newEditRecipe