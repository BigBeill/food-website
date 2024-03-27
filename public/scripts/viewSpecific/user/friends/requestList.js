console.log(input)

input.forEach(user => {
    fetch('/user/findUser/_id/' + user)
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
})