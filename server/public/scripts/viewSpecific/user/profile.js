const logoutButton = document.getElementById("logoutButton");

if (logoutButton){
    console.log("logoutButton found")
}

logoutButton.addEventListener("click", () => {
    var postRequest = {
        method: 'POST'
    }
    console.log("attempting fetch")
    fetch('logout', postRequest) .then((response) => {
        location.assign(response.url)
    })
})
