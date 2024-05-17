//for testing only! this needs to be removed before production
import React, { useRef, useState, useEffect } from 'react'

function DevToolsRouter(){
  const [name, setName] = useState("")
  const [unitType, setUnitType] = useState("Grams")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [fat, setFat] = useState("")
  const [carbohydrates, setCarbohydrates] = useState("")
  const [sodium, setSodium] = useState("")
  const [fiber, setFiber] = useState("")

  function addIngredientHandler() {
    const ingredientData = {
      name: name,
      unitType: unitType,
      calories: calories,
      protein: protein,
      fat: fat,
      carbohydrates: carbohydrates,
      sodium: sodium,
      fiber: fiber
    }

    var missingData = false
    for (const key in ingredientData) {
      if (ingredientData[key].length == 0) {
        missingData = true
      }
    }

    if (!missingData) {
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
        <label>unitType</label> 
        <select onChange={(event) => setUnitType(event.target.value)}>
          <option>grams</option>
          <option>milliliters</option>
          <option>cups</option>
          <option>none</option>
        </select>
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