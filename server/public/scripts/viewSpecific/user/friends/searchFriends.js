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
    //empty username section
    output.innerHTML = ""

    if (input.value.length == 0){
        output.innerHTML = "<p>invalid search</p>"
        return
    }

    //get all usernames from db that match search
    fetch('/user/findUser/username/' + input.value)
    .then(response => response.json())
    .then(data => {
        console.log(data)

        //if no usernames found that match search, tell user
        if (data.length == 0){
            output.innerHTML = "<p>no users found</p>"
        } 
        
        //display any usernames returned by query to user, with a button to go with each username
        else {
            data.forEach(userInfo => {
                output.innerHTML +=
                    `<div class="userPin">
                        <p>` + userInfo.username + `</p>
                        <button class="addFriendButton" id="friendId_` + userInfo._id + `"> Add friend </button>
                    </div>`
            });
            //add an event listener to each button associated with a username
            addButtonListeners()
        }
    })
}

function addButtonListeners () {
    //get all buttons that have been associated with a username
    var addFriendButtons = document.getElementsByClassName("addFriendButton")
    Array.prototype.forEach.call(addFriendButtons, (button) => {
        //add a click event listener to each button
        button.addEventListener("click", (event) => {
            //on click seond a post request to server to attach friend request to target
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
            .then(() => {
                button.classList.add("hidden")
            })
        })
    })
}