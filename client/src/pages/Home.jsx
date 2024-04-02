import React, { useEffect, useState } from 'react';
import Pin from '../components/pin'

function Home() {
  import('./Home.css')

  useEffect(() => {
    fetchRecipeData()
  }, [])

  const [recipes, setRecipes] = useState([]);

  const fetchRecipeData = async() => {
    await fetch('server/recipe/publicRecipes')
    .then(response => response.json())
    .then(data => {
      const flattenedRecipes = data.flat();
      setRecipes(flattenedRecipes);
    })
    .catch(error => {console.error("Error fetching Recipes:", error);})
  }

  if (!recipes.length) {
    return <p className="softText">no owned recipes</p>
  }
  return (
    <div className="recipesDisplayContainer split">
      {recipes.map(recipe => (
        <Pin key={recipe._id} recipe={recipe} />
      ))}
    </div>
  );
}

export default Home