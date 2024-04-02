import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import './login.css'

function Login(){
  console.log("building login form")

  useEffect(() => {
    console.log("importing image")
    import('./loginImage.css')
  }, [])

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  function attemptLogin(){
    console.log("Login button clicked")

    const postRequest = {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8', },
      body: JSON.stringify({
        username: username,
        password: password,
      })
    }

    fetch("server/user/login", postRequest)
    .then(response => {
      console.log(response) 
      location.assign('/')
    })
  }

  return(
    <>
    <div className="loginForm split" id="loginForm">
      <h1>Login</h1>
      
      <div className="textInput">
        <input 
        type="text" 
        name="userName" 
        id="username" 
        placeholder=' '
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        />
        <label htmlFor="username">Username</label>
        <span className="error hidden">No username given</span>
        <span className="error hidden">Username not found</span>
      </div>

      <div className="textInput">
        <input 
        type="password" 
        name="password" 
        id="password" 
        placeholder=' '
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        />
        <label htmlFor="password">Password</label>
        <span className="error hidden">No password given</span>
        <span className="error hidden">Incorrect password</span>
      </div>

      <div className="splitSpace">
      <div className="checkboxInput">
            <input type="checkbox"
            name="remember me" 
            id="remember" 
            value="1"/>
            <label htmlFor="remember">Remember Me</label>
        </div>
      </div>

      <button 
      name="Submit" 
      id="submitButton"
      onClick={attemptLogin}
      > Login </button>

      <p>dont have an account?</p>
      <a href='/register'>create account</a>
      
    </div>
    </>
  )
}

export default Login