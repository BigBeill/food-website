import React, { useEffect, useState } from 'react'

function recipeBook() {

  useEffect (() =>{
    fetchRecipeData()
  }, [])

  const [recipeList, setRecipeList] = useState([]);

  function fetchRecipeData(){
    fetch('server/recipe/findRecipes')
    .then(response => response.json())
    .then(data => setRecipeList(data))
    .catch(console.log("unable to get recipes from server"))
  }

  return(
    <div className='openNotebook'>
      <div className='notebookPage'>

        <div className='recipeContainer'>
          {recipeList.map((recipe, index) => (
            <div key={index} className='notebookRecipe'>
              <h4>{recipe.title}</h4>

            </div>
          ))}
        </div>

      </div>
      <img className="notebookSpine" src="/notebookSpine.png" alt="notebookSpine" />
      <div className='notebookPage'>
         
      </div>
    </div>
  )
}

export default recipeBook