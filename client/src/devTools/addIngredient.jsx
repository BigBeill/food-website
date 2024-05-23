//for testing only! this needs to be removed before production
import React, { useRef, useState, useEffect } from 'react'

function DevToolsRouter(){
  const [name, setName] = useState("")
  const [physical, setPhysical] = useState("")
  const [volume, setVolume] = useState("")
  const [unitType, setUnitType] = useState({
    weight: false,
    physical: false,
    volume: false
  })
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [fat, setFat] = useState("")
  const [carbohydrates, setCarbohydrates] = useState("")
  const [sodium, setSodium] = useState("")
  const [fiber, setFiber] = useState("")

  function addIngredientHandler() {
    const ingredientData = {
      name: name,
      physical: physical,
      volume: volume,
      unitType: [],
      calories: calories,
      protein: protein,
      fat: fat,
      carbohydrates: carbohydrates,
      sodium: sodium,
      fiber: fiber
    }

    if (unitType.weight) { ingredientData.unitType.push("weight")}
    if (unitType.physical) { ingredientData.unitType.push("physical")}
    if (unitType.volume) { ingredientData.unitType.push("volume")}

    console.log(ingredientData)

    const postRequest = {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8', },
      body: JSON.stringify(ingredientData)
    }
    
    fetch("server/devTools/addIngredient", postRequest)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      window.location.reload()
    })
  }

  function checkboxChange(event) {
    const name = event.target.name
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setUnitType({
      ...unitType,
      [name]: value
    });
    
  }

  return (
    <>
    <div className="formTypeA">
      <div className='textInput'>
        <label>name</label> 
        <input type="text" 
        value={name}
        onChange={(event) => setName(event.target.value)}/>
      </div>

      <div className='textInput'>
        <label>physical</label> 
        <input type="number" 
        value={physical}
        onChange={(event) => setPhysical(event.target.value)}/>
      </div>

      <div className='textInput'>
        <label>volume</label> 
        <input type="number" 
        value={volume}
        onChange={(event) => setVolume(event.target.value)}/>
      </div>

      <div>
        <input type="checkbox" id="weight" name="weight" value="weight" 
        checked={unitType.weight} onChange={checkboxChange}/>
        <label htmlFor="weight">weight   </label>
        <input type="checkbox" id="physical" name="physical" value="physical" 
        checked={unitType.physical} onChange={checkboxChange}/>
        <label htmlFor="physical">physical   </label>
        <input type="checkbox" id="volume" name="volume" value="volume" 
        checked={unitType.volume} onChange={checkboxChange}/>
        <label htmlFor="volume">volume   </label>
      </div>

      <div className='textInput'>
        <label>calories</label> 
        <input type="number" 
        value={calories}
        onChange={(event) => setCalories(event.target.value)}/>
      </div>

      <div className='textInput'>
        <label>protein</label> 
        <input type="number" 
        value={protein}
        onChange={(event) => setProtein(event.target.value)}/>
      </div>

      <div className='textInput'>
        <label>fat</label> 
        <input type="number" 
        value={fat}
        onChange={(event) => setFat(event.target.value)}/>
      </div>

      <div className='textInput'>
        <label>carbohydrates</label> 
        <input type="number" 
        value={carbohydrates}
        onChange={(event) => setCarbohydrates(event.target.value)}/>
      </div>

      <div className='textInput'>
        <label>sodium</label> 
        <input type="number" 
        value={sodium}
        onChange={(event) => setSodium(event.target.value)}/>
      </div>

      <div className='textInput'>
        <label>fiber</label> 
        <input type="number" 
        value={fiber}
        onChange={(event) => setFiber(event.target.value)}/>
      </div>

      <div className='button'>
        <input 
        type='button' 
        value='add Ingredient'
        onClick={addIngredientHandler}/>
      </div>
    </div>
    
    </>
  )
}

export default DevToolsRouter