import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from './api/axios';

import Layout from './Layout'
import { routes } from './routes'

function App() {
  const [userData, setUserData] = useState ({})

  useEffect(() => {

    axios({ method:'get', url:`user/info` })
    .then(response => { 
      setUserData(response) 
    })
    .catch((error) => {
      console.error(error);
      setUserData({_id: "", username: ""});
    });

  },[]);

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