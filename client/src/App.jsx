import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import Profile from './pages/Profile'
import EditRecipe from './pages/EditRecipe'
import FriendsList from './pages/FriendsList'
import AddIngredient from './devTools/addIngredient'
import NewEditRecipe from './pages/NewEditRecipe'

import Layout from './Layout'
import { routes } from './routes'

function App() {

  useEffect(() => {
    fetchUserData()
  }, [])

  const [userData, setUserData] = useState ({})

  const fetchUserData = async() => {
    await fetch('server/user/userInfo')
    .then(response => response.json())
    .then(data => {setUserData(data)})
    .catch(error => {
      console.error("No user found", error) 
      setUserData({_id: "", username: ""})
    })
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout userData={userData}/>}>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App