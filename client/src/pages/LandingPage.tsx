import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import axios from "../api/axios";
import Recipe from "./Recipe"
import RecipeObject   from "../interfaces/RecipeObject";
import Loading from "../components/Loading";

export default function LandingPage() {

   const { userId } = useOutletContext<{userId: string}>();

   const [recipe, setRecipe] = useState<RecipeObject | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   //collect test recipe from the database
   useEffect(() => {
      console.log("Fetching test recipe...");
      axios({ method: 'get', url: `recipe/getObject/6879a6901775cc14af3170ef/true` })
         .then((response) => { 
            setRecipe(response); 
         })
         .catch((error) => { 
            console.error("Error fetching recipe:", error); 
            setError("Failed to load featured recipe. Please try again later.");
         })
         .then(( ) => { setLoading(false); });
   }, []);

   if (loading) { return <Loading />; }

   if (error) {
      return (
         <div className="standardPage">
            <h1>Error</h1>
            <p>{error}</p>
         </div>
      );
   }

   return (
      <>
        <section className="splitSpace" style={{ paddingBottom: '6rem', }}>
            {/* Main title card */}
            <div className="standardContent" style={{ marginTop: '6rem',}}>
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
            {recipe ? (
               <div className="miniModelWithFade alignOnHover" style={{ width: '24rem', }}>
                  <Recipe recipe={recipe} />
               </div>
            ) : (
               <p>No featured recipe available.</p>
            )}
         </section>

         {/* Features Section */}
         <section className="contentCollection centerText">
            <div className="collection">
               <div className="standardContent">
                  <div className="icon">🍳</div>
                  <h3>Create Recipes</h3>
                  <p>Build and organize your personal recipe collection with detailed ingredients and instructions</p>
                  <a href="/editRecipe" className="feature-link">Start Creating →</a>
               </div>
               <div className="standardContent">
                  <div className="icon">🌍</div>
                  <h3>Explore Public Recipes</h3>
                  <p>Discover amazing recipes shared by the community and find inspiration for your next meal</p>
                  <a href="/searchRecipes/public" className="feature-link">Explore Now →</a>
               </div>
               <div className="standardContent">
                  <div className="icon">👥</div>
                  <h3>Connect with Friends</h3>
                  <p>Share recipes with friends and discover what they're cooking in their kitchen</p>
                  <a href="/searchUser/friends" className="feature-link">Find Friends →</a>
               </div>
            </div>
         </section>

         {/* Quick Access Section */}
         <section className="contentCollection centerText">
            <div className="collection">
               <div className="standardContentAsButton growOnHover">
                  <div className="icon">📖</div>
                  <a  href="/searchRecipes/public">Browse Recipes</a>
               </div>
               {userId ? (
                  <>
                     <div className="standardContentAsButton growOnHover">
                        <div className="icon">📋</div>
                        <a href="/searchRecipes/personal">My Recipes</a>
                     </div>
                     <div className="standardContentAsButton growOnHover">
                        <div className="icon">👫</div>
                        <a href="/searchRecipes/friends">Friend's Recipes</a>
                     </div>
                     <div className="standardContentAsButton growOnHover">
                        <div className="icon">👤</div>
                        <a href="/profile">My Profile</a>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="standardContentAsButton growOnHover">
                        <div className="icon">🔐</div>
                        <a href="/login">Login</a>
                     </div>
                     <div className="standardContentAsButton growOnHover">
                        <div className="icon">✨</div>
                        <a href="/register">Register</a>
                     </div>
                  </>
               )}
               <div className="standardContentAsButton growOnHover">
                  <div className="icon">ℹ️</div>
                  <a href="/aboutMe">About</a>
               </div>
            </div>
         </section>

         {/* Info Section */}
         <section className="splitSpace" style={{marginTop: '6rem',}}>
            <div className="standardContent">
               <h3>About This Project</h3>
               <p>
                  Created by Mackenzie Neill as a personal project to practice web development,
                  networking, and cybersecurity skills. This experimental platform allows you to
                  create, share, and discover amazing recipes.
               </p>
               <div className="info-links">
                  <a className="callToActionButton primary" href="https://github.com/BigBeill/Food-Recipe-Sharing-Platform" target="_blank" rel="noopener noreferrer">
                     View on GitHub
                  </a>
                  <a className="callToActionButton secondary" href="/aboutMe">
                     Learn More
                  </a>
               </div>
            </div>
            <div className="standardContent warningBox">
               <h3>Security Notice</h3>
               <p>As this is an experimental side project, servers are not regularly monitored for security vulnerabilities. Please follow general best practices for keeping your data safe on the internet:</p>
               <ul>
                  <li>Always use unique passwords for online accounts</li>
                  <li>Don't share personal or sensitive information</li>
                  <li>Consider all content you post potentially public</li>
               </ul>
            </div>
         </section>
      </>
   );
}