// external imports
import React, {useEffect, useState} from "react";
import { useParams, useNavigate } from 'react-router-dom';

// internal imports
import axios from '../api/axios';

export default function Ingredients () {
  const params = useParams();
  const navigate = useNavigate();

  const [groupID, setGroupID] = useState('');
  const [ingredientID, setIngredientID] = useState('');

  useEffect(() => {
    if (params.groupID) { setGroupID(params.groupID); }
    else { setGroupID(''); }
    if (params.ingredientID) { setIngredientID(params.ingredientID); }
    else { setIngredientID('') }
  },[params]);

  function selectGroup(group) {
    navigate(`/ingredients/${group.foodgroupid}`);
  }

  function selectIngredient(ingredient) {
    navigate(`/ingredients/${groupID}/${ingredient.foodid}`);
  }

  // router for page
  if (!groupID) {
    return <GroupList clickHandler={selectGroup}/>
  } else if (!ingredientID) {
    return <IngredientList groupID={groupID} clickHandler={selectIngredient}/>
  } else {
    return <IngredientDetails ingredientID={ingredientID}/>
  }
}

function GroupList({clickHandler}) {
  const [groupList, setGroupList] = useState([]);

  useEffect(() => {
    axios({ method: 'get', url:`ingredient/groups` })
    .then(response => {
      setGroupList(response)
    })
    .catch(error => console.error(error));
  },[]);

  return (
    <div className="displayButtons">
      {groupList.map((row, index) => (
        <button key={index} onClick={() => clickHandler(row)}>{row.foodgroupname}</button>
      ))}
    </div>
  );
}

function IngredientList({groupID, clickHandler}) {
  const [ingredientList, setIngredientList] = useState([])

  useEffect(() => {
    axios({ method: 'get', url:`ingredient/list?foodGroupId=${groupID}` })
    .then(setIngredientList)
    .catch(error => console.error(error));
  },[])

  return (
    <div className="displayButtons">
      {ingredientList.map((row, index) => (
        <button key={index} onClick={() => clickHandler(row)}>{row.fooddescription}</button>
      ))}
    </div>
  )
}

function IngredientDetails({ingredientID}) {
  const [ingredientData, setIngredientData] = useState({});
  const [amount, setAmount] = useState({value: 100, unit: 'g'});
  
  useEffect(() => {
    axios({ method: 'get', url:`ingredient/details/?foodId=${ingredientID}` })
    .then(response => { 
      setIngredientData(response);
    })
    .catch(error => console.error(error));
  },[]);

  if (Object.keys(ingredientData).length == 0) { return <p>loading page</p> }
  return (
    <div className="whiteBackground">
      <h1>{ingredientData.foodDescription}</h1>
      <input type='number' value={amount.value} onChange={(event) => setAmount({...amount, value: event.target.value})}/>
      <p>calories: {((ingredientData.nutrition.calories/100) * amount.value).toFixed(0)}</p>
      <p>fat: {((ingredientData.nutrition.fat/100) * amount.value).toFixed(2)}g</p>
      <p>cholesterol: {((ingredientData.nutrition.cholesterol/100) * amount.value).toFixed(0)}mg</p>
      <p>sodium: {((ingredientData.nutrition.sodium/100) * amount.value).toFixed(0)}mg</p>
      <p>potassium: {((ingredientData.nutrition.potassium/100) * amount.value).toFixed(0)}mg</p>
      <p>carbohydrates: {((ingredientData.nutrition.carbohydrates/100) * amount.value).toFixed(2)}g</p>
      <p>fibre: {((ingredientData.nutrition.fibre/100) * amount.value).toFixed(1)}g</p>
      <p>sugar: {((ingredientData.nutrition.sugar/100) * amount.value).toFixed(2)}g</p>
      <p>protein: {((ingredientData.nutrition.protein/100) * amount.value).toFixed(2)}g</p>
    </div>
  );
}