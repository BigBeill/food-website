


function Login(){
  console.log("building login form")

  return(
    <>
    <div className="pageContentTypeA centred" id="loginForm">
      <h1>Login</h1>
      
      <div className="textInput">
        <label htmlFor="uname">Username</label>
        <input 
        type="text" 
        name="userName" 
        id="uname" 
        placeholder="Your Username"
        />
        <span className="error hidden">No username given</span>
        <span className="error hidden">Username not found</span>
      </div>

      <div className="textInput">
        <label htmlFor="password">Password</label>
        <input 
        type="password" 
        name="password" 
        id="password" 
        placeholder="Your Password" 
        />
        <span className="error hidden">No password given</span>
        <span className="error hidden">Incorrect password</span>
      </div>

      <div className="splitSpace">
        <div className="buttonInput">
          <input 
          type="submit" 
          name="Submit" 
          id="submitButton"
          value="Login"
          />
        </div>

        <div className="checkboxInput">
            <input type="checkbox"
            name="remember me" 
            id="remember" 
            value="1"/>
            <label htmlFor="remember">Remember Me</label>
        </div>
      </div>
    </div>
    </>
  )
}

export default Login