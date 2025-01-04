// external imports
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// internal imports
import axios from './api/axios';
import Layout from './Layout'
import Loading from './components/Loading'
import { routes } from './routes'

function App() {
  // userData is passed down to all children
  const [userData, setUserData] = useState()

  useEffect(() => {

    axios({ method: 'get', url: `user/info` })
      .then(response => {
        setUserData({
          _id: response._id,
          username: response.username,
          email: response.email,
          bio: response.bio
        });
      })
      .catch(() => {
        setUserData({});
      });

  }, []);

  //don't load the main page until userData has been collected
  if (!userData) { return <Loading /> }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout userData={userData} />}>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App