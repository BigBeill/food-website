import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Login from './pages/Login'
import Home from './pages/Home'

function App() {

  useEffect(() => {
    fetchUserData()
  }, [])

  const [userData, setUserData] = useState ([])

  const fetchUserData = async() => {
      await fetch('server/user/userInfo')
      .then(response => response.json())
      .then(data => {setUserData([data])})
      .catch(error => {console.error("No user found", error);})
  }

  return (
    <BrowserRouter>
      <div className='splitSpace background'>
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