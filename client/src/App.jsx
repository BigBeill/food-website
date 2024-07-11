import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from './Layout'
import { routes } from './routes'

function App() {

  useEffect(() => {
    fetchUserData()
  }, [])

  const [userData, setUserData] = useState ({})

  function fetchUserData() {
    fetch('/server/user/userInfo')
    .then(response => response.json())
    .then(setUserData)
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