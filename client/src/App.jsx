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
      <Nav userData = {userData}/>
        <main>
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/login" exact element={<Login />} />
            <Route path="/register" exact element={<Register />} />
            <Route path="/editRecipe" exact element={<EditRecipe />} />
            <Route path="/friendsList" exact element={<FriendsList />} />
            <Route path="/profile" exact element={<Profile userData = {userData} />} />
            <Route path="/addIngredient" exact element={<AddIngredient />} /> {/*remove before production*/}
          </Routes>
        </main>
    </BrowserRouter>
  )
}

export default App