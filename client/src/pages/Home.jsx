// external imports
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';

// internal imports
import NoteBook from '../components/NoteBook';

export default function Home() {

  const [recipeName, setRecipeName] = useState('')
  const [ingredientList, setIngredientList] = useState([])
  const [pageNumber, setPageNumber] = useState(0)

  useEffect(() => {

  }, [pageNumber])

  const pageList = [{
    name: MainPage,
    props: {
      recipeName,
      setRecipeName,
      ingredientList,
      setIngredientList
    }
  }]

  return <NoteBook pageList={pageList} />
}

function MainPage({recipeName, setRecipeName, ingredientList, setIngredientList}) {

  const [newIngredient, setNewIngredient] = useState('')

  function addIngredient() {
    if (!newIngredient) { return }

    setIngredientList(list => [...list, newIngredient])
    setNewIngredient('')
  }

  return (
    <div className='standardPage'>
      <h1>Public Recipes</h1>

      <div className='textInput'>
        <label>Name</label>
        <input type='text' value={recipeName} onChange={(event) => setRecipeName(event.target.value)} placeholder='recipe name' />
      </div>

      <div className='textInput sideButton'>
        <div>
          <label>Ingredients</label>
          <input type='text' value={newIngredient} onChange={(event) => setNewIngredient(event.target.value)} placeholder='ingredient name' />
        </div>
        <div className='svgButtonContainer'>
          <FontAwesomeIcon icon={faCircleCheck} onClick={() => { addIngredient() }}/>
        </div>
      </div>

      <ul className='itemList'>
        {ingredientList.map((item, index) => (
          <li key={index}> {item} </li>
        ))}
      </ul>

      <button> search </button>
    </div>
  )
}

function DisplayRecipes({recipes}) {

  return(
    <>
      {recipes.map((item, index) => (
        <p key={index}>{item.title}</p>
      ))}
    </>
  )
}