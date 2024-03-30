import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './components/Home'

function App() {

  const [backendData, setBackendData] = useState([{}])

  return (
    <BrowserRouter>
      <div>
        <Nav />
        <Routes>
          <Route path="/" exact element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App