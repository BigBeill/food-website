import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from './api/axios';

import Layout from './Layout'
import { routes } from './routes'

function App() {
  // userData should be passed down to all children
  // userData.collected means client has received user data and if _id is still missing then the user is not signed in
  const [userData, setUserData] = useState ({ collected:false })

  useEffect(() => {

    axios({ method:'get', url:`user/info` })
    .then(response => { 
      setUserData({ _id: response._id, username: response.username, collected: true});
    })
    .catch((error) => {
      console.error(error);
      setUserData({ collected: true });
    });

  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout userData={userData}/>}>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element}/>
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App