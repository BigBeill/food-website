//code for opening/closing the nav bar
const navBar = document.getElementById('navBar')
const thumbButton = document.getElementById('thumbButton');
thumbButton.addEventListener("click", () => {
  if (navBar.classList.contains("open"))
    navBar.classList.remove("open");
  else
    navBar.classList.add("open");
});

/*
//js for logout button in nav
const logoutButton = document.getElementById("logoutButton");
if (logoutButton){
  logoutButton.addEventListener("click", () => {
    fetch('/logout?_method=DELETE', {method: 'POST'})
    window.location.href = '/user/login';
  });
}
*/


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
