import React, { useState, useEffect, useRef} from 'react'

function Nav(data) {
    const [open, setOpen] = useState(false);
    
    function openNav() {
        console.log("button clicked")
        setOpen(!open)
    }

    return(
        <>
        <nav className={`navBar ${open ? 'open' : ''}`} id="navBar">

            <img className="logo" src="/BigBeill-logo_black.png" alt="Beill Greenhouse Logo" />


            <h3>Find Recipes</h3>
            <a href="/">Public</a>
            <a href="/index">Following</a>
            <a href="/index">Search</a>

            {   
                data.userData._id != "" ?
                <>

                <h3>Your Recipes</h3>
                <a href="/recipeBook">Personal</a>
                <a href="/index">Saved</a>
                <a href="/editRecipe?recipe=new">New Recipe</a>

                <h3>Social</h3>
                <a href="/friendsList">Friends</a>

                <h3>Account</h3>
                <a href="/profile">Profile</a>
                
                </> : <>
                
                <h3>Account</h3>
                <a href="/login">Login</a>
                <a href="/register">Create Account</a>
                
                </>
            }

            <div className='navButton' onClick={openNav}/>

        </nav>
        </>
    )
}

export default Nav