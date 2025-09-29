import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import axios from "../api/axios";
import Recipe from "./Recipe"
import RecipeObject   from "../interfaces/RecipeObject";

export default function LandingPage() {

   const { userId } = useOutletContext<{userId: string}>();

   const [recipe, setRecipe] = useState<RecipeObject | undefined>(undefined);

   //collect test recipe from the database
   useEffect(() => {
      console.log("Fetching test recipe...");
      axios({ method: 'get', url: `recipe/getObject/6879a6901775cc14af3170ef/true` })
         .then((response) => { 
            console.log("Test recipe fetched:", response);
            setRecipe(response); 
         })
         .catch((error) => { console.error("Error fetching recipe:", error); });
   }, []);

   return (
      <>
        <section className="splitSpace" style={{ paddingBottom: '6rem', }}>
            {/* Main title card */}
            <div className="standardPageNicer" style={{ marginTop: '6rem',}}>
               <h1>Welcome to Big Beill's Greenhouse</h1>
               <p style={{ fontSize: '1.2rem' }}> Discover, create, and share amazing recipes with a community of food enthusiasts </p>
               <div>
                  {!userId ? (
                     <>
                        <a href="/register" className="callToActionButton primary">Get Started</a>
                        <a href="/login" className="callToActionButton secondary">Sign In</a>
                     </>
                  ) : (
                     <>
                        <a href="/editRecipe" className="callToActionButton primary">Create Recipe</a>
                        <a href="/searchRecipes/personal" className="callToActionButton secondary">My Recipes</a>
                     </>
                  )}
               </div>
            </div>
            <div className="miniModelWithFade alignOnFocus" style={{ width: 'calc(100% - 30em)', }}>
               <Recipe recipe={recipe} />
            </div>
         </section>
      </>
   );
}