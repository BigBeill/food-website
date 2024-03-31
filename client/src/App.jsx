import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './components/Home'
import Login from './pages/Login'

function App() {

  useEffect(() => {
    fetchUserData()
  }, [])

  const [userData, setUserData] = useState ([])

  const fetchUserData = async() => {
      await fetch('server/user/userInfo')
      .then(response => response.json())
      .then(data => {setUserData([data])})
      .catch(() => {console.log("no user found")})
  }

  return (
    <BrowserRouter>
      <div>
        <Nav userData = {userData}/>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" exact element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App