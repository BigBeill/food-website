//css that goes with login page

const loginForm = document.getElementById("loginForm");
const submitButton = document.getElementById("submitButton");

const usernameInput = document.getElementById("uname");
const usernameNone = usernameInput.nextElementSibling;
const usernameInvalid = usernameNone.nextElementSibling;

const passwordInput = document.getElementById("password");
const passwordNone = passwordInput.nextElementSibling;
const passwordInvalid = passwordNone.nextElementSibling;

submitButton.addEventListener("click", () => {
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
    if (usernameInput.value != "BigBeill"){
      usernameInvalid.classList.remove("hidden");
    }
    else if (passwordInput.value != "123"){
      passwordInvalid.classList.remove("hidden");
    }
    else{
      
    }
  }
});