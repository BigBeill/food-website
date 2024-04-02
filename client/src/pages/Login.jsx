import React, { Suspense } from 'react'


function Login(){
  console.log("building login form")
  import('./login.css')


  return(
    <>
    <div className="loginForm" id="loginForm">
      <h1>Login</h1>
      
      <div className="textInput">
        <input 
        type="text" 
        name="userName" 
        id="uname" 
        />
        <label htmlFor="uname">Username</label>
        <span className="error hidden">No username given</span>
        <span className="error hidden">Username not found</span>
      </div>

      <div className="textInput">
        <input 
        type="password" 
        name="password" 
        id="password" 
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

      <div className="buttonInput">
        <input 
        type="submit" 
        name="Submit" 
        id="submitButton"
        value="Login"
        />
      </div>
      
    </div>
    </>
  )
}

export default Login