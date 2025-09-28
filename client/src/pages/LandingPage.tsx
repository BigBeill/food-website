import { useOutletContext } from "react-router-dom";

export default function LandingPage() {

   const { userId } = useOutletContext<{userId: string}>();

   return (
      <div className="landingPage">
         {/* Hero Section */}
         <section className="hero-section">
            <div className="hero-content">
               <div className="hero-text">
                  <h1 className="hero-title">Welcome to Beill's Greenhouse</h1>
                  <p className="hero-subtitle">
                     Discover, create, and share amazing recipes with a community of food enthusiasts
                  </p>
                  <div className="hero-actions">
                     {!userId ? (
                        <>
                           <a href="/register" className="cta-button primary">Get Started</a>
                           <a href="/login" className="cta-button secondary">Sign In</a>
                        </>
                     ) : (
                        <>
                           <a href="/editRecipe" className="cta-button primary">Create Recipe</a>
                           <a href="/searchRecipes/personal" className="cta-button secondary">My Recipes</a>
                        </>
                     )}
                  </div>
               </div>
               <div className="hero-image">
                  <div className="recipe-card-preview">
                     <div className="preview-header">
                        <div className="preview-title">Featured Recipe</div>
                        <div className="preview-image"></div>
                     </div>
                     <div className="preview-content">
                        <div className="preview-line long"></div>
                        <div className="preview-line medium"></div>
                        <div className="preview-line short"></div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Features Section */}
         <section className="features-section">
            <div className="features-container">
               <h2>What You Can Do</h2>
               <div className="features-grid">
                  <div className="feature-card">
                     <div className="feature-icon">🍳</div>
                     <h3>Create Recipes</h3>
                     <p>Build and organize your personal recipe collection with detailed ingredients and instructions</p>
                     <a href="/editRecipe" className="feature-link">Start Creating →</a>
                  </div>
                  <div className="feature-card">
                     <div className="feature-icon">🌍</div>
                     <h3>Explore Public Recipes</h3>
                     <p>Discover amazing recipes shared by the community and find inspiration for your next meal</p>
                     <a href="/searchRecipes/public" className="feature-link">Explore Now →</a>
                  </div>
                  <div className="feature-card">
                     <div className="feature-icon">👥</div>
                     <h3>Connect with Friends</h3>
                     <p>Share recipes with friends and discover what they're cooking in their kitchen</p>
                     <a href="/searchUser/friends" className="feature-link">Find Friends →</a>
                  </div>
               </div>
            </div>
         </section>

         {/* Quick Access Section */}
         <section className="quick-access-section">
            <div className="quick-access-container">
               <h2>Quick Access</h2>
               <div className="quick-access-grid">
                  <a href="/searchRecipes/public" className="quick-access-card">
                     <div className="card-icon">📖</div>
                     <span>Browse Recipes</span>
                  </a>
                  {userId ? (
                     <>
                        <a href="/searchRecipes/personal" className="quick-access-card">
                           <div className="card-icon">📋</div>
                           <span>My Recipes</span>
                        </a>
                        <a href="/searchRecipes/friends" className="quick-access-card">
                           <div className="card-icon">👫</div>
                           <span>Friends' Recipes</span>
                        </a>
                        <a href="/profile" className="quick-access-card">
                           <div className="card-icon">👤</div>
                           <span>My Profile</span>
                        </a>
                     </>
                  ) : (
                     <>
                        <a href="/login" className="quick-access-card">
                           <div className="card-icon">🔐</div>
                           <span>Login</span>
                        </a>
                        <a href="/register" className="quick-access-card">
                           <div className="card-icon">✨</div>
                           <span>Register</span>
                        </a>
                     </>
                  )}
                  <a href="/aboutMe" className="quick-access-card">
                     <div className="card-icon">ℹ️</div>
                     <span>About</span>
                  </a>
               </div>
            </div>
         </section>

         {/* Info Section */}
         <section className="info-section">
            <div className="info-container">
               <div className="info-card">
                  <h3>About This Project</h3>
                  <p>
                     Created by Mackenzie Neill as a personal project to practice web development,
                     networking, and cybersecurity skills. This experimental platform allows you to
                     create, share, and discover amazing recipes.
                  </p>
                  <div className="info-links">
                     <a href="https://github.com/BigBeill/food-website" target="_blank" rel="noopener noreferrer" className="info-link">
                        View on GitHub →
                     </a>
                     <a href="/aboutMe" className="info-link">
                        Learn More →
                     </a>
                  </div>
               </div>
               <div className="info-card security-notice">
                  <h3>Security Notice</h3>
                  <p>As this is an experimental project, please follow these security guidelines:</p>
                  <ul className="security-list">
                     <li>Use a unique password for this site</li>
                     <li>Don't share personal or sensitive information</li>
                     <li>Consider all content potentially public</li>
                  </ul>
               </div>
            </div>
         </section>
      </div>
   );
}