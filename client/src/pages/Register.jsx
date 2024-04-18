import React, { useRef, useState, useEffect } from 'react'
//import './login.css' //import already being done by login.jsx, no point in importing it twice

function Register() {
  const errorRef = useRef()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [passwordOne, setPasswordOne] = useState("")
  const [passwordTwo, setPasswordTwo] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    import('./loginImage.css')
  }, [])

  useEffect(() => {
    setErrorMessage("")
  }, [username, email, passwordOne, passwordTwo])

  function attemptRegister () {
    if (!username){setErrorMessage("no username given")}
    else if (!email){setErrorMessage("no email given")}
    else if (!passwordOne){setErrorMessage("no password given")}
    else if (passwordOne != passwordTwo){setErrorMessage("passwords dont match")}
    else {

      const postRequest = {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=UTF-8', },
        body: JSON.stringify({
          username: username,
          email: email,
          password: passwordOne,
        })
      }

      fetch("server/user/register", postRequest)
      .then(response => response.json())
      .then(data => {
        if (data.message == "badUser"){setErrorMessage("username taken")}
        if (data.message == "badEmail"){setErrorMessage("email already used")}
        if (data.message == "success"){location.assign('/')}
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
        type="password" 
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
        type="password" 
        name="passwordTwo" 
        id="passwordTwo" 
        placeholder=' '
        value={passwordTwo}
        onChange={(event) => setPasswordTwo(event.target.value)}
        />
        <label htmlFor="passwordTwo">Confirm Password</label>
      </div>

      <button
      name="submit"
      id="submitButton"
      onClick={attemptRegister}
      > Create Account </button>

      <p ref={errorRef} className={errorMessage ? "error" : "hidden"} area-live="assertive">{errorMessage}</p>

      <p>Already have an account?</p>
      <a href='/login'>Login</a>

    </div>
    </>
  )
}

export default Register