import "../../styles/pageSpecific/recipePreview.scss";
import RecipeObject from "../../interfaces/RecipeObject";

export default function RecipePreview(recipe: RecipeObject) {
   return (
      <div className="recipePreviewPage">
         <h1>{recipe.title}</h1>
         <p className="image">🍗</p>
      </div>
   );
};