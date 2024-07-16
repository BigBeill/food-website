import React, { useEffect, useState } from 'react'
import NoteBook from '../components/NoteBook'

export default function Home() {

  const [recipeName, setRecipeName] = useState('')
  const [ingredients, setIngredients] = useState('')

  const pageList = [
    {
      name: MainPage,
      props: {
        recipeName: recipeName,
        setRecipeName: setRecipeName
      }
    }
  ]

  return <NoteBook pageList={pageList} />
}

function MainPage({recipeName, setRecipeName}) {

  const [newIngredient, setNewIngredient] = useState('')

  return (
    <div className='standardPage'>
      <h1>Public Recipes</h1>

      <div className='textInput'>
        <label>Name</label>
        <input type='text' value={recipeName} onChange={(event) => setRecipeName(event.target.value)} placeholder='recipe name' />
      </div>

      <div className='textInput'>
        <label>Ingredients</label>
        <input type='text' value={newIngredient} onChange={(event) => setNewIngredient(event.target.value)} placeholder='ingredient name' />
      </div>

      <ul className='itemList'>

      </ul>

      <button> search </button>
    </div>
  )
}

function DisplayRecipes(recipes) {

}