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
    fetch('login', postRequest) .then((response) => {
      if (response.redirected){
        location.assign(response.url)
      }
    })
   }
}