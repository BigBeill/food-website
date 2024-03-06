//code for opening/closing the nav bar
const navBar = document.getElementById('navBar')
const thumbButton = document.getElementById('thumbButton');
thumbButton.addEventListener("click", () => {
  if (navBar.classList.contains("open"))
    navBar.classList.remove("open");
  else
    navBar.classList.add("open");
});



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



//js code for search bar
const searchBarInput = document.getElementById("searchBar").lastElementChild;

searchBarInput.addEventListener("keydown", (event) => {
    if(event.key == "Enter"){
        console.log("search" + searchBarInput.value)
        window.location.href = "index/search?value=" + searchBarInput.value
    }
})