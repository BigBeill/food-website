import React, { useState, useEffect, useRef, Component} from 'react'
import { useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import ActiveSearchBar from '../components/ActiveSearchBar'
import NoteBook from '../components/NoteBook'
import { Reorder } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';

function NewEditRecipe ({userData}) {
  //if (userData._id == ""){ return <Navigate to='/login' />}

  const [searchParams] = useSearchParams()
  const recipeId = searchParams.get('recipeId')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  const [ingredientList, setIngredientList] = useState([])

  const [instructionList, setInstructionList] = useState([{id:0, content:'test1'},{id:1, content:'test2'},{id:2, content:'test3'}])

  useEffect (() => {
    if (recipeId) {
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

        let tempArray = []
        let id = 0
        recipeData.ingredients.forEach((item) => {
          tempArray.push({
            id: id,
            content: item
          })
          id++
        })
        setIngredientList(tempArray)

        tempArray = []
        id = 0
        recipeData.instructions.forEach((item) => {
          tempArray.push({
            id: id,
            content: item
          })
          id++
        })
        setInstructionList(tempArray)
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

      <div className='textInput'>
        <label>New Ingredient</label>
        <input  placeholder='add ingredient'/>
      </div>
    </div>
  )
}

function InstructionPage ({instructionList, setInstructionList}) {
  const [newInstruction, setNewInstruction] = useState('')

  function addInstruction() {
    if(newInstruction.length != 0){
      setInstructionList((list) => {return [...list, {
        id: list.length,
        content: newInstruction
      }]})
      setNewInstruction('')
    }
  }

  function removeInstruction(index){
    let tempArray = instructionList.slice()
    console.log(tempArray)
    const holdId = tempArray[index].id
    tempArray.splice(index, 1)
    for (let item of tempArray){
      if (item.id == tempArray.length){
        item.id = holdId
        break
      }
    }
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