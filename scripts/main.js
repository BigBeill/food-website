//general css that will be equipped to every html document


//css for nav bar
const navBar = document.getElementById('navBar');
navBar.innerHTML = 
` <img class="logo" src="./images/BigBeill-logo_black.png" alt="Beill Greenhouse Logo">

<h3>Find Recipes</h3>
<a href="index.html">Public</a>
<a href="index.html">Friends</a>
<a href="index.html">Search</a>

<h3>Your Recipes</h3>
<a href="index.html">Owned</a>
<a href="index.html">Saved</a>

<h3>Account</h3>
<a href="login.html">Login</a>
<a href="register.html">Create Account</a> 
<div class="thumbButton" id="thumbButton"></div>`;

const thumbButton = document.getElementById('thumbButton');

thumbButton.addEventListener("click", () => {
  if (navBar.classList.contains("open")){
    navBar.classList.remove("open");
  }
  else{
    navBar.classList.add("open");
  }
});

const checkboxList = document.querySelectorAll(".checkboxInput");

checkboxList.forEach(function (checkboxDiv){
  console.log("checkbox found");
  const checkbox = checkboxDiv.querySelector("input");
  console.log(checkbox)
  checkboxDiv.addEventListener("click", () => {
    console.log("clicked");
    if (checkbox.checked){
      checkbox.checked = false;
    }
    else{
      checkbox.checked = true;
    }
  });
});
