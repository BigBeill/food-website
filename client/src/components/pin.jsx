import React from 'react';
import PropTypes from 'prop-types';

function Pin({ recipe }) {
    import('./pin.css')

    Pin.propTypes = {
        recipe: PropTypes.shape({
          _id: PropTypes.id,
          image: PropTypes.string,
          title: PropTypes.string,
          description: PropTypes.string,
        }).isRequired,
      };
      
    return (
        <div className="pin" id={recipe._id}> 
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