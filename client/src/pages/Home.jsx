import React, { useEffect, useState } from 'react'
import RecipeBook from './RecipeBook'

function Home() {

  useEffect(() => {
    fetchRecipeData()
  }, [])

  const [recipes, setRecipes] = useState([]);

  const fetchRecipeData = async() => {
    await fetch('server/recipe/findRecipes')
    .then(response => response.json())
    .then(data => setRecipes(data))
    .catch(error => {console.error("Error fetching Recipes:", error);})
  }

  if (!recipes.length) {
    return <p className="softText">no owned recipes</p>
  }
  else {
    return (<RecipeBook recipeList={recipes}/>)
  }
}

export default Home