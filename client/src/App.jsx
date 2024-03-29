import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './components/Home'

function App() {

  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    fetch("/api")
    .then (response => response.json()) 
    .then (
      data => {
        setBackendData(data)
      }
    )
  }, [])

  return (
    <BrowserRouter>
      <div>
        <Nav />
        <Routes>
          <Route path="/" exact component={Home} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App