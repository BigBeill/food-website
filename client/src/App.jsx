import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from './api/axios'

import Layout from './Layout'
import { routes } from './routes'

function App() {
  const [userData, setUserData] = useState ({})

  async function getUser({isMounted, controller}) {
    try {
      const response = await axios.get('/user/info', {
        signal: controller.signal
      });
      console.log(response.data);
    } catch(error){
      console.error(error);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    getUser({isMounted, controller})

    return () => {
      isMounted = false;
      controller.abort();
    }
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