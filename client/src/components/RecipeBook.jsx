import React, { useEffect, useRef, useState } from 'react';
import '../styles/RecipeBook.scss'

function RecipeTitle({title}) {
  
  const textRef = useRef(null)
  const containerRef = useRef(null)
  const [fontSize, setFontSize] = useState(0.1)

  function adjustFontSize() {
    if (containerRef.current && textRef.current) {
      let newFontSize = .1
      textRef.current.style.fontSize = `${newFontSize}rem`

      while ( textRef.current.scrollWidth <= containerRef.current.clientWidth && textRef.current.scrollHeight <= containerRef.current.clientHeight ) {
        newFontSize += .1
        textRef.current.style.fontSize = `${newFontSize}rem`
      }

      setFontSize(newFontSize - .2)
    }
  }
  
  useEffect(() => {
    adjustFontSize()
    window.addEventListener('resize', adjustFontSize)
    return () => window.removeEventListener('resize', adjustFontSize)
  }, [])

  useEffect(() => {
    console.log("new font size")
    if (textRef.current) {
      textRef.current.style.fontSize = `${fontSize}rem`;
    }
  }, [fontSize]);

  return (
  <div className='recipeTitle' ref={containerRef}>
    <h4 ref={textRef}>
      {title}
    </h4>
  </div>)
}

function recipeBook(recipeList) {

  return(
    <div className='openNotebook'>
      <div className='notebookPage'>

        <div className='recipeContainer'>
         {recipeList.map((recipe, index) => (
            <div key={index} className='notebookRecipe'>
               <RecipeTitle title={recipe.title} />
               <p className='image'>{recipe.image}</p>
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