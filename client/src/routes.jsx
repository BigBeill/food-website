import Home from './pages/Home'

import EditRecipe from "./pages/EditRecipe"
import FriendsList from './pages/FriendsList'
import Login from './pages/Login'
import NewEditRecipe from './pages/NewEditRecipe'
import Profile from './pages/Profile'
import RecipeBook from "./pages/RecipeBook"
import Register from './pages/Register'

import AddIngredient from './devTools/addIngredient'

export const routes = [
  {
    path:'/',
    element:<Home />,
  },
  {
    path:'/home',
    element:<Home />,
  },
  {
    path:'/editRecipe',
    element:<EditRecipe />,
  },
  {
    path:'/friendsList',
    element:<FriendsList />,
  },
  {
    path:'/login',
    element:<Login />,
  },
  {
    path:'/newEditRecipe/:recipeId',
    element:<NewEditRecipe />,
  },
  {
    path:'/profile',
    element:<Profile />,
  },
  {
    path:'/recipeBook',
    element:<RecipeBook />,
  },
  {
    path:'/register',
    element:<Register />,
  },
  {
    path:'/addIngredient',
    element:<AddIngredient />,
  }
]