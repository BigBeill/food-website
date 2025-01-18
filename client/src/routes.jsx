// internal imports
import Home from './pages/Home'
import EditRecipe from "./pages/EditRecipe"
import FriendsList from './pages/FriendsList'
import Ingredients from './pages/Ingredients'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'
import SearchUser from './pages/SearchUser'
import Admin from './pages/Admin'

import TestPage from './pages/TestingCode'

import NotFound from './pages/NotFound'

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
    path:'/profile',
    element:<Profile />,
  },
  {
    path:'/register',
    element:<Register />,
  },
  {
    path:'searchUser',
    element:<SearchUser />,
  },
  {
    path: '/ingredients/:groupID?/:ingredientID?',
    element: <Ingredients />
  },
  {
    path: '/admin',
    element: <Admin />
  },
  {
    path:'/test',
    element:<TestPage />,
  },
  {
    path:'*',
    element:<NotFound />,
  }
]