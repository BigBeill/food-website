const recipeForm = document.getElementById("recipeForm")
const submitButton = document.getElementById("submitButton")

const titleInput = document.getElementById("recipeName")
const titleNone = titleInput.nextElementSibling

const descriptionInput = document.getElementById("description")
const descriptionNone = descriptionInput.nextElementSibling

submitButton.addEventListener("click", addRecpie)

function addRecpie() {
    let errors = false

    titleNone.classList.add("hidden")
    descriptionNone.classList.add("hidden")

    if (titleInput.value.length == 0){
        titleNone.classList.remove("hidden")
        errors = true
    }

    if (descriptionInput.value.length == 0){
        descriptionNone.classList.remove("hidden")
        errors = true
    }

    if (!errors){
        var postRequest = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: "application/json",
            },
            body: JSON.stringify({
              title: titleInput.value,
              description: descriptionInput.value
            })
        }
        fetch('new', postRequest) .then((response) => {
            if (response.redirected){
              location.assign(response.url)
            }
        })
    }
}