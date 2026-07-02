"use client"

import useAuth from "@/features/auth/hooks/useAuth";
import RecipePage from "@/features/recipes/components/RecipePage";
import { ButtonPaired } from "@/shared/components/Buttons";
import { useRouter } from "next/navigation";
import MiniComponent from "@/shared/components/miniComponent";
import AnimationCrooked from "@/shared/animations/crooked.animation";

export default function LandingPage() {

   const { authId } = useAuth();
   const router = useRouter();

   const featuredRecipeId = '6879a6901775cc14af3170ef';

   return (
      <>
        <section className="splitSpace" style={{ paddingBottom: '6rem', }}>
            {/* Main title card */}
            <div className="standardContent" style={{ marginTop: '6rem',}}>
               <h1>Welcome to Big Beill's Kitchen</h1>
               <p style={{ fontSize: '1.2rem' }}> Discover, create, and share amazing recipes with a community of food enthusiasts </p>
               {!authId ? (
                  <ButtonPaired 
                     firstText="Get started" 
                     firstOnClick={ () => router.push("/auth/register") }
                     secondText="Sign In"
                     secondOnClick={ () => router.push("/auth/login") }
                  />
               ) : (
                  <ButtonPaired
                     firstText="Create Recipe"
                     firstOnClick={ () => router.push("/editRecipe") }
                     secondText="My Recipes"
                     secondOnClick={ () => router.push("/searchRecipes/personal") }
                  />
               )}
            </div>
            <AnimationCrooked>
               <MiniComponent>
                  <RecipePage recipe={featuredRecipeId}/>
               </MiniComponent>
            </AnimationCrooked>
         </section>

         {/* Features Section */}
         <section className="contentCollection centerText">
            <h2 className="screenReaderOnly">Links To Core Features</h2>
            <div className="collection">
               <div className="standardContent">
                  <div aria-hidden="true" className="icon">🍳</div>
                  <h3>Create Recipes</h3>
                  <p>Build and organize your personal recipe collection with detailed ingredients and instructions</p>
                  <a href="/editRecipe" className="feature-link">Start Creating <span aria-hidden="true">→</span></a>
               </div>
               <div className="standardContent">
                  <div aria-hidden="true" className="icon">🌍</div>
                  <h3>Explore Public Recipes</h3>
                  <p>Discover amazing recipes shared by the community and find inspiration for your next meal</p>
                  <a href="/searchRecipes/public" className="feature-link">Explore Now <span aria-hidden="true">→</span></a>
               </div>
               <div className="standardContent">
                  <div aria-hidden="true" className="icon">👥</div>
                  <h3>Connect with Friends</h3>
                  <p>Share recipes with friends and discover what they're cooking in their kitchen</p>
                  <a href="/searchUser/friends" className="feature-link">Find Friends <span aria-hidden="true">→</span></a>
               </div>
            </div>
         </section>

         {/* Quick Access Section */}
         <section className="contentCollection centerText">
            <h2 className="screenReaderOnly">Quick Access Links</h2>
            <div className="collection">
               <div className="buttonContent growOnHover">
                  <div aria-hidden="true" className="icon">📖</div>
                  <a  href="/searchRecipes/public">Browse Recipes</a>
               </div>
               {authId ? (
                  <>
                     <div className="buttonContent growOnHover">
                        <div aria-hidden="true" className="icon">📋</div>
                        <a href="/searchRecipes/personal">My Recipes</a>
                     </div>
                     <div className="buttonContent growOnHover">
                        <div aria-hidden="true" className="icon">👫</div>
                        <a href="/searchRecipes/friends">Friend's Recipes</a>
                     </div>
                     <div className="buttonContent growOnHover">
                        <div aria-hidden="true" className="icon">👤</div>
                        <a href="/profile">My Profile</a>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="buttonContent growOnHover">
                        <div aria-hidden="true" className="icon">🔐</div>
                        <a href="/login">Login</a>
                     </div>
                     <div className="buttonContent growOnHover">
                        <div aria-hidden="true" className="icon">✨</div>
                        <a href="/register">Register</a>
                     </div>
                  </>
               )}
               <div className="buttonContent growOnHover">
                  <div aria-hidden="true" className="icon">ℹ️</div>
                  <a href="/aboutMe">About</a>
               </div>
            </div>
         </section>

         {/* Info Section */}
         <section className="splitSpace" style={{marginTop: '6rem',}}>
            <h2 className="screenReaderOnly">Additional Information</h2>
            <div className="standardContent">
               <h3>About This Project</h3>
               <p>
                  Created by Mackenzie Neill as a personal project to practice web development,
                  networking, and cybersecurity skills. This experimental platform allows you to
                  create, share, and discover amazing recipes.
               </p>
               <ButtonPaired
                  firstText="View on Github"
                  firstOnClick={ () => window.location.href="https://github.com/BigBeill/Food-Recipe-Sharing-Platform" }
                  secondText="Learn More"
                  secondOnClick={ () => router.push("/about") }
               />
            </div>
            <div className="warningContent">
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