import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from '../api/axios';
import NoteBook from '../components/NoteBook'
import { Reorder } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { assignIds, removeIds } from '../tools/general'

export default function NewEditRecipe () {
  
  const navigate = useNavigate();
  const { userData } = useOutletContext();
  const [searchParams] = useSearchParams();

  const recipeId = searchParams.get('recipeId');

  // make sure current user is signed in, otherwise redirect to login
  if (userData._id == "") navigate('/login');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const [ingredientList, setIngredientList] = useState([]);

  const [instructionList, setInstructionList] = useState([]);

  useEffect (() => {
    // if recipe exists, populate this page with recipes data from server
    if (recipeId) {
      axios({ method:'get', url:`recipe/data?_id=${recipeId}` })
      .then (response => {
        setTitle(response.title);
        setDescription(response.description);
        setImage(response.image);
        setIngredientList(assignIds(response.ingredients));
        setInstructionList(assignIds(response.instructions));
      })
      .catch(console.error);
    }
  },[])

  function submitRecipe(){
    let method
    if (!recipeId) { method = 'post' }
    else { method = 'put' }

    const recipeData = {
      id: recipeId,
      title: title,
      description: description,
      image: image,
      ingredients: removeIds(ingredientList),
      instructions: removeIds(instructionList)
    }

    axios({ method:method, url:'recipe/edit', data: recipeData })
    .then(() => { navigate('/'); })
    .catch(console.error);
  }

  const pageList = [
    {
      name: GeneralInfoPage,
      props: {
        newRecipe: !recipeId,
        title,
        setTitle,
        description, 
        setDescription,
      }
    },
    { 
      name: ImagePage,
      props: {
        image,
        setImage,
      }
    },
    { 
      name: IngredientPage,
      props: {
        ingredientList,
        setIngredientList
      }
    },
    { 
      name: InstructionPage,
      props: {
        instructionList,
        setInstructionList
      }
    },
    {
      name: SubmissionPage,
      props: {
        submitRecipe
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

  const [newIngredient, setNewIngredient] = useState({foodId:"", foodDescription:"", measureId:"", unit:"", amount:""})
  const [conversionFactorsAvailable, setConversionFactorsAvailable] = useState([{ measureId: '1489', unit: 'g' }])
  const [ingredientsAvailable, setIngredientsAvailable] = useState([])
  const [availableId, setAvailableId] = useState(ingredientList.length)
  
  function updateNewIngredientName (value) {
    setNewIngredient({...newIngredient, foodId:"", foodDescription: value});
    if (value.length >= 3) searchIngredients(value);
    else setIngredientsAvailable([]);
  }

  //fetch up to 10 ingredients from database that have similar names to value given
  function searchIngredients (value) { 
    axios({ method: 'get', url:`ingredient/list?foodDescription=${value}&limit=10` })
    .then(setIngredientsAvailable)
    .catch(error => { console.error('unable to fetch ingredients:', error); });
  }

  function ingredientSelected (foodId) {
    axios({ method: 'get', url:`ingredient/details?foodId=${foodId}`})
    .then(response => {
      setNewIngredient({ ...newIngredient, foodId, foodDescription: response.foodDescription});
      setConversionFactorsAvailable([ ...response.conversionFactors, { measureId: '1455', unit: 'g' } ]);
    });

    setIngredientsAvailable([]);
  }

  function addIngredient () {
    if (!newIngredient.foodId || !newIngredient.unit || !newIngredient.amount) return
    setIngredientList([...ingredientList, {id: availableId, content: newIngredient} ]);
    setAvailableId( availableId+1 );
    setNewIngredient({foodId:"", foodDescription:"", unit:"", amount:""});
  }

  function removeIngredient (index) {
    let tempArray = ingredientList.slice()
    tempArray.splice(index, 1)
    setIngredientList(tempArray)
  }

  return (
    <div className='standardPage'>
      <h2>Recipe Ingredients</h2>

      {/* ingredients list */}
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
              <p>{item.content.amount} {item.content.unit}{item.content.amount != 1 ? 's' : ''} of {item.content.foodDescription}</p>
              )}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* add new ingredient section */}
      <div className='textInput shared'>
        <label>New Ingredient</label>
        <div className='inputs'>
          <input type='number' value={newIngredient.amount} onChange={(event) => setNewIngredient({...newIngredient, amount: event.target.value})} placeholder='Amount'/>
          <select value={newIngredient.unit} onChange={(event) => setNewIngredient({...newIngredient, measureId: event.target.options[event.target.selectedIndex].id, unit: event.target.value})} >
            <option value="" disabled hidden className='light'>Units</option>
            {conversionFactorsAvailable.map((conversionFactor, index) => (
              <option key={index} id={conversionFactor.measureId}>{conversionFactor.unit}</option>
            ))}
          </select>
          <div className='activeSearchBar'> {/* ingredient search bar */}
            <input type='text' className='mainInput' value={newIngredient.foodDescription} onChange={(event) => {updateNewIngredientName(event.target.value)}} placeholder='Ingredient Name'/>
            <ul className={`${ingredientsAvailable.length == 0 ? 'hidden' : ''}`}>
              {ingredientsAvailable.map(ingredient => (
                <li key={ingredient.foodid} onClick={() => ingredientSelected(ingredient.foodid)}> {ingredient.fooddescription} </li>
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
    if(newInstruction.length < 3) { return }

    setInstructionList(list => [...list, {
      id: availableId,
      content: newInstruction
    }])
    
    setAvailableId(availableId+1)
    setNewInstruction('')
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