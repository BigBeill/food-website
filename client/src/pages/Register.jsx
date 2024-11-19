import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from '../api/axios';

function Register() {
  const errorRef = useRef();
  const navigate = useNavigate();
  const { userData } = useOutletContext();

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [passwordOne, setPasswordOne] = useState("")
  const [passwordTwo, setPasswordTwo] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (userData._id) navigate('/profile');
    document.body.classList.add('loginBackground')
    return () => { document.body.classList.remove('loginBackground') }
  }, [])

  useEffect(() => {
    setErrorMessage("")
  }, [username, email, passwordOne, passwordTwo])

  function attemptRegister() {

    if (!username) return setErrorMessage("no username given");
    if (!email) return setErrorMessage("no email given");
    if (!passwordOne) return setErrorMessage("no password given");
    if (passwordOne != passwordTwo) return setErrorMessage("passwords don't match");

    const userData = { username, email, password:passwordOne };
    axios({ method:'post', url:'user/register', data: userData })
    .then(() => { 
      navigate('/');
      window.location.reload();
    })
    .catch(response => { setErrorMessage(response.error); });
  }

  return (
    <>
      {/* css for loginForm and registerForm will be the same */}
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
            onKeyDown={(event) => { if (event.key === 'Enter') { attemptRegister() } }}

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
            onKeyDown={(event) => { if (event.key === 'Enter') { attemptRegister() } }}

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
            onKeyDown={(event) => { if (event.key === 'Enter') { attemptRegister() } }}
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
            onKeyDown={(event) => { if (event.key === 'Enter') { attemptRegister() } }}
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