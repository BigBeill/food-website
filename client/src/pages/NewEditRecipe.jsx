import React, { useState, useEffect, useRef, Component} from 'react'
import { useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import ActiveSearchBar from '../components/ActiveSearchBar'
import NoteBook from '../components/NoteBook';
import editRecipe from './EditRecipe';

function newEditRecipe ({userData}) {
  if (userData._id == ""){ return <Navigate to='/login' />}

  const [searchParams] = useSearchParams()
  const recipeId = searchParams.get('recipeId')

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  
  const pageList = [
    {
      name: GeneralInfo,
      props: {
        newRecipe: !recipeId,
        title: [title, setTitle],
        description: [description, setDescription]
      }
    },
    { 
      name: RecipeImage,
      props: {
        image: [image, setImage]
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
      <p>page three</p>
    </>
  )
}

function Page4 () {
  return (
    <>
      <p>page four</p>
    </>
  )
}

export default newEditRecipe