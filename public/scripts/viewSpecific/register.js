//js that go with the register page

const usernameInput = document.getElementById("username");
const usernameNone = usernameInput.nextElementSibling;
const usernameInvalid = usernameNone.nextElementSibling;

const emailInput = document.getElementById("email");
const emailNone = emailInput.nextElementSibling;
const emailInvalid = emailNone.nextElementSibling;

const passwordInputOne = document.getElementById("password1");
const passwordNoneOne = passwordInputOne.nextElementSibling;
const passwordUnmatched = passwordNoneOne.nextElementSibling;
const passwordInputTwo = document.getElementById("password2");
const passwordNoneTwo = passwordInputTwo.nextElementSibling;

const submitButton = document.getElementById("submit");

submitButton.addEventListener("click", () => {
    let errors = false;
    usernameNone.classList.add("hidden");
    usernameInvalid.classList.add("hidden");
    emailNone.classList.add("hidden");
    emailInvalid.classList.add("hidden");
    passwordNoneOne.classList.add("hidden");
    passwordNoneTwo.classList.add("hidden");
    passwordUnmatched.classList.add("hidden");

    if (usernameInput.value.length == 0){
        usernameNone.classList.remove("hidden");
        errors = true;
    }

    if (emailInput.value.length == 0){
        emailNone.classList.remove("hidden");
        errors = true;
    }

    if (passwordInputOne.value.length == 0){
        passwordNoneOne.classList.remove("hidden");
        errors = true;
    }
    else if (passwordInputTwo.value.length == 0){
        passwordNoneTwo.classList.remove("hidden");
        errors = true;
    }
    else if (passwordInputOne.value != passwordInputTwo.value){
        passwordUnmatched.classList.remove("hidden");
        errors = true;
    }

    if (!errors){
        var postRequest = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: "application/json",
            },
            body: JSON.stringify({
              username: usernameInput.value,
              password: passwordInputOne.value
            })
        }
        fetch('register', postRequest) .then((response) => {
            console.log(response)
            if (response.redirected){
                location.assign(response.url)
            }
            if (!response.usernameAvailable){
                usernameInvalid.classList.remove("hidden")
            }
            if (!response.emailAvailable){
                emailInvalid.classList.remove("hidden")
            }
        })
    }
});