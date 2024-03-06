//js code for search bar
const searchBarInput = document.getElementById("searchBar").lastElementChild;

searchBarInput.addEventListener("keydown", (event) => {
    if(event.key == "Enter"){
        console.log("search" + searchBarInput.value)
        window.location.href = "index?search=" + searchBarInput.value
    }
})