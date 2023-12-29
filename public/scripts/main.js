//general javascript code that will be equipped to every html document

var user_id = sessionStorage.getItem('user_id');

//html for nav bar
const navBar = document.getElementById('navBar');
navBar.innerHTML = 
` <img class="logo" src="./images/BigBeill-logo_black.png" alt="Beill Greenhouse Logo">

<h3>Find Recipes</h3>
<a href="index">Public</a>
<a href="index">Friends</a>
<a href="index">Search</a>

<h3>Your Recipes</h3>
<a href="index">Personal</a>
<a href="index">Saved</a>

<h3>Account</h3>`;

if (user_id == null){
  navBar.innerHTML +=
  `<a href="login">Login</a>
  <a href="register">Create Account</a>`;
}
else {
  navBar.innerHTML +=
  `<a href="index">Settings</a>
  <button id="logoutButton">Logout</button>`;
}

navBar.innerHTML += `<div class="thumbButton" id="thumbButton"></div>`



//code for opening/closing the nav bar
const thumbButton = document.getElementById('thumbButton');
thumbButton.addEventListener("click", () => {
  if (navBar.classList.contains("open"))
    navBar.classList.remove("open");
  else
    navBar.classList.add("open");
});

//js for logout button in nav
const logoutButton = document.getElementById("logoutButton");
if (logoutButton){
  logoutButton.addEventListener("click", () => {
    fetch('/logout?_method=DELETE', {method: 'POST'})
    window.location.href = 'login';
  });
}



//for each div around a checkbox, add an event listener that lets user click the whole div
const checkboxList = document.querySelectorAll(".checkboxInput");
checkboxList.forEach(function (checkboxDiv){
  const checkbox = checkboxDiv.querySelector("input");
  const checkboxLabel = checkboxDiv.querySelector("label");
  checkboxDiv.addEventListener("click", (event) => {
    if (!(event.target == checkbox || event.target == checkboxLabel)){
      if (checkbox.checked)
        checkbox.checked = false;
      else
        checkbox.checked = true;
    }
  });
});
