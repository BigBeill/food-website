import '../styles/componentSpecific/nav.scss'

import React, { useState, useEffect, useRef} from 'react'
import { NavLink } from "react-router-dom";

function Nav({userData}) {
    const [open, setOpen] = useState(false);
    
    function openNav() {
        setOpen(!open)
    }

    return(
        <>
        <nav className={`navBar ${open ? 'open' : ''}`} id="navBar">

            <img className="logo" src="/BigBeill-logo_black.png" alt="Beill Greenhouse Logo" />


            <h3>Find Recipes</h3>
            <NavLink className="navLink" to="/">Public</NavLink>
            <NavLink className="navLink" to="/index">Following</NavLink>
            <NavLink className="navLink" to="/index">Search</NavLink>

            {   
                userData._id != "" ?
                <>

                <h3>Your Recipes</h3>
                <NavLink className="navLink" to="/recipeBook">Personal</NavLink>
                <NavLink className="navLink" to="/index">Saved</NavLink>
                <NavLink className="navLink" to="/editRecipe">New Recipe</NavLink>

                <h3>Social</h3>
                <NavLink className="navLink" to="/friendsList">Friends</NavLink>

                <h3>Account</h3>
                <NavLink className="navLink" to="/profile">Profile</NavLink>
                
                </> : <>
                
                <h3>Account</h3>
                <NavLink className="navLink" to="/login">Login</NavLink>
                <NavLink className="navLink" to="/register">Create Account</NavLink>
                
                </>
            }

            <div className='navButton' onClick={openNav}/>

        </nav>
        </>
    )
}

export default Nav