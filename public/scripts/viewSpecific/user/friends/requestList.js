console.log(input)
output = document.getElementById("usernameSection")

if (input.length == 0){
    output.innerHTML = "<p> No pending friend requests </p>"
} else {
    count = 0
    input.forEach(user => {
        count++
        fetch('/user/findUser/_id/' + user)
        .then(response => response.json())
        .then(data => {
            console.log(data)

            output.innerHTML += 
            `<div class="userPin">
                <p>` + data.username + `</p>
                <button class="acceptFriendButton" id="acceptId_` + data._id + `"> Accept Request </button>
                <button class="rejectFriendButton" id="rejectId_` + data._id + `"> Reject Request </button>
            </div>`

            if (count == input.length) {
                addButtonListeners()
            }
        })
    })
}

function addButtonListeners() {
    acceptButtons = document.getElementsByClassName("acceptFriendButton")
    console.log(acceptButtons)
    Array.prototype.forEach.call(acceptButtons, (button) => {
        button.addEventListener("click", (event) => {
            userId = button.id.replace("acceptId_", "")
            console.log("attempting to accept friend request from id: " + userId)
            var postRequest = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    id: button.id.replace("acceptId_", "")
                })
            }

            fetch('acceptRequest', postRequest)
            .then((response) => {
                console.log(response)
                button.classList.add("hidden")
            })
        })
    })

    rejectButtons = document.getElementsByClassName("rejectFriendButton")
    Array.prototype.forEach.call(rejectButtons, (button) => {
        button.addEventListener("click", (event) => {
            userId = button.id.replace("rejectId_", "")
            console.log("attempting to reject friend request from id: " + userId)
            var postRequest = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    id: button.id.replace("rejectId_", "")
                })
            }

            fetch('rejectRequest', postRequest)
            .then((response) => {
                console.log(response)
                button.classList.add("hidden")
            })
        })
    })
}