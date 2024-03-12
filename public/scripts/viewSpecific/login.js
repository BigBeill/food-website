//js that goes with login page

const loginForm = document.getElementById("loginForm");
const submitButton = document.getElementById("submitButton");

const usernameInput = document.getElementById("uname");
const usernameNone = usernameInput.nextElementSibling;
const usernameInvalid = usernameNone.nextElementSibling;

const passwordInput = document.getElementById("password");
const passwordNone = passwordInput.nextElementSibling;
const passwordInvalid = passwordNone.nextElementSibling;

submitButton.addEventListener("click", attemptLogin);
passwordInput.addEventListener("keydown", (event) => {
  if(event.key == "Enter")
    attemptLogin();
});

function attemptLogin() {
  let errors = false;
  
  usernameNone.classList.add("hidden");
  usernameInvalid.classList.add("hidden");
  
  passwordNone.classList.add("hidden");
  passwordInvalid.classList.add("hidden");
  
  if (usernameInput.value.length == 0){
    usernameNone.classList.remove("hidden");
    errors = true;
  }
  
  if (passwordInput.value.length == 0){
    passwordNone.classList.remove("hidden");
    errors = true;
  }
  
  if (!errors){
    // submit a login post request to try and sign user in
    var postRequest = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value
      })
    }
    fetch('login', postRequest) 
    .then((response) => {

      //if postRequest to login returns a redirect, go to new page
      if (response.redirected){
        location.assign(response.url)
        exit()
      }

      //if no redirect given, submit a getRequest to tools/getFlash to find out why
      var getRequest = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: "application/json",
        }
      }

      fetch('/tools/getFlash', getRequest) 
      .then(response => response.json()) 
      .then((data) => {
        try{
          //grab the error from flashMessages
          var message = data.flashMessage.error[0]

          //show user why they were not able to sign in
          if (message == "badUser"){
            usernameInvalid.classList.remove("hidden")
            passwordInvalid.classList.add("hidden")
          } else if (message == "badPass"){
            usernameInvalid.classList.add("hidden")
            passwordInvalid.classList.remove("hidden")
          } else {
            //if unexpected error returned print to client console for debugging
            usernameInvalid.classList.add("hidden")
            passwordInvalid.classList.add("hidden")
            console.log("unexpected flash given from passport: ", message)
          }

        } catch {
          //if any issues with getting error from tools/getFlash, notify client by printing to console
          console.log("error reading flash message from passport")
        }
      })
    })
   }
}