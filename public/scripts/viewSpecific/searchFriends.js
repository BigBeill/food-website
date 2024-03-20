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
    output.innerHTML = ""
    
    fetch('/user/findUser/username/' + input.value)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if (data.length == 0){
            output.innerHTML = "<p>no users found</p>"
        }
        data.forEach(userInfo => {
            output.innerHTML +=
                `<div class="userPin">
                    <p>` + userInfo.username + `</p>
                    <button class="addFriendButton" id="friendId_` + userInfo._id + `"> Add friend </button>
                </div>`
        });
        addButtonListeners()
    })
}

function addButtonListeners () {
    var addFriendButtons = document.getElementsByClassName("addFriendButton")
    Array.prototype.forEach.call(addFriendButtons, (button) => {
        button.addEventListener("click", (event) => {
            var postRequest = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    id: button.id.replace("friendId_", "")
                })
            }
            fetch('sendRequest', postRequest)
            .then((response) => {
                button.classList.add("hidden")
            })
        })
    })
}