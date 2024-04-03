import React, { useState, useEffect } from 'react'
//import './login.css' //import already being done by login.jsx, no point in importing it twice

function Register() {
  useEffect(() => {
    import('./loginImage.css')
  }, [])

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [passwordOne, setPasswordOne] = useState("")
  const [passwordTwo, setPasswordTwo] = useState("")

  function attemptRegister () {
    if (passwordOne != passwordTwo){
      return;
    }

    const postRequest = {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8', },
      body: JSON.stringify({
        username: username,
        email: email,
        passwordOne: passwordOne,
      })
    }
  }

  return (
    <>
    {/* css for loginForm and resgisterForm will be the same */}
    <div className='loginForm' id="registerForm">
      <h1>Create Account</h1>

      <div className='textInput'>
      <input 
        type="text" 
        name="username" 
        id="username" 
        placeholder=' '
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        />
        <label htmlFor="username">Username</label>
      </div>

      <div className='textInput'>
      <input 
        type="text" 
        name="email" 
        id="email" 
        placeholder=' '
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="email">Email</label>
      </div>

      <div className='textInput'>
        <input 
        type="text" 
        name="passwordOne" 
        id="passwordOne" 
        placeholder=' '
        value={passwordOne}
        onChange={(event) => setPasswordOne(event.target.value)}
        />
        <label htmlFor="passwordOne">Password</label>
      </div>

      <div className='textInput'>
        <input 
        type="text" 
        name="passwordTwo" 
        id="passwordTwo" 
        placeholder=' '
        value={passwordTwo}
        onChange={(event) => setPasswordTwo(event.target.value)}
        />
        <label htmlFor="passwordTwo">Confirm Password</label>
      </div>

      <span className="error hidden">No username given</span>
      <span className="error hidden">Invalid username</span>
      <span className="error hidden">Username already taken</span>
      <span className="error hidden">No email given</span>
      <span className="error hidden">Invalid email</span>
      <span className="error hidden">No password given</span>
      <span className="error hidden">Invalid password</span>
      <span className="error hidden">Passwords don't match</span>

      <button
      name="submit"
      id="submitButton"
      onClick={attemptRegister}
      > Create Account </button>

      <p>Already have an account?</p>
      <a href='/login'>Login</a>

    </div>
    </>
  )
}

export default Register