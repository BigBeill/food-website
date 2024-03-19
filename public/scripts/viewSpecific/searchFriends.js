const input = document.getElementById("friendsSearchInput")
const submitButton = document.getElementById("friendsSearchSubmit")
const output = document.getElementById("usernameSection")

submitButton.addEventListener("click", getUsers)
input.addEventListener("keydown", (event) => {
    if (event.key == "Enter"){
        getUsers()
    }
})

function getUsers() {
    output.innerHTML == ""
    
    fetch('/user/findUser/username/' + input.value)
    .then(response => response.json())
    .then(data => {
        if (data.length == 0){
            output.innerHTML == "<p>no users found</p>"
        }
        data.forEach(info => {
            output.innerHTML += ""
        });
    })
}