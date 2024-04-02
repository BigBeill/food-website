import React from 'react';

function Pin({ recipe }) {

    return (
        <div className="pin" id="pin"> 
          <div className="pin-inner">
            <div className="pin-front">
              <div className="recipeImage">
                {recipe.image}
              </div>
              <div className="recipeTitle">
                <h2>{recipe.title}</h2>
              </div>
            </div>
            <div className="pin-back">
              <div className="recipeImage">
                {recipe.image}
              </div>
              <p>{recipe.description}</p>
            </div>
          </div>
        </div> 
      );
}

export default Pin