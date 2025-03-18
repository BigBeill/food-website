// external imports
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';

// internal imports
import Notebook from '../components/Notebook';

import PageObject from '../interfaces/PageObject';

export default function Home() {

  const [recipeName, setRecipeName] = useState<string>('')
  const [ingredientList, setIngredientList] = useState<string[]>([])

  useEffect(() => {

  }, [pageNumber])
   const [pageNumber, setPageNumber] = useState<number>(1);

  const pageList: PageObject[] = [{
    content: MainPage,
    props: {
      recipeName,
      setRecipeName,
      ingredientList,
      setIngredientList
    }
  }]

  return <Notebook pageList={pageList} />
}

interface MainPageProps {
  recipeName: string;
  setRecipeName: React.Dispatch<React.SetStateAction<string>>;
  ingredientList: string[];
  setIngredientList: React.Dispatch<React.SetStateAction<string[]>>;
}

function MainPage({recipeName, setRecipeName, ingredientList, setIngredientList}: MainPageProps) {

  const [newIngredient, setNewIngredient] = useState('')

  function addIngredient() {
    if (!newIngredient) { return; }

    setIngredientList((list: string[]) => [...list, newIngredient]);
    setNewIngredient('');
  }

  return (
    <div className='standardPage'>
      <h1>Public Recipes</h1>

      <div className='textInput additionalMargin'>
        <label>Name</label>
        <input type='text' value={recipeName} onChange={(event) => setRecipeName(event.target.value)} placeholder='recipe name' />
      </div>

      <div className='textInput sideButton additionalMargin'>
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

      <button className='additionalMargin'> search </button>
    </div>
  )
}