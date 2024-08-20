import '../styles/componentSpecific/nav.scss'

import React, { useState, useEffect, useRef} from 'react'
import { NavLink } from "react-router-dom";

function Nav({userData}) {
    const [open, setOpen] = useState(false);
    const navRef = useRef(null);
    
    // open/close the nav bar whenever the handle on the side of the nav panel is clicked
    function openNav() {
        setOpen(!open);
    }

    // close the nav bar whenever the user clicks outside of it
    function handleOutsideClick(event) {
        if (navRef.current && !navRef.current.contains(event.target)) {
            setOpen(false);
        }
    }

    // detect a click outside the nav bar
    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => { document.removeEventListener("mousedown", handleOutsideClick); }
    }, []);

    return(
        <>
        <nav ref={navRef} className={`navBar ${open ? 'open' : ''}`} id="navBar">

            <img className="logo" src="/BigBeill-logo_black.png" alt="Beill Greenhouse Logo" />


            <h3>Find Recipes</h3>
            <NavLink className="navLink" to="/">Public</NavLink>
            <NavLink className="navLink" to="/index">Following</NavLink>
            <NavLink className="navLink" to="/index">Search</NavLink>

            {   
                userData._id ?
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

            <h3>Info</h3>
            <NavLink className="navLink" to="/ingredients">Ingredients List</NavLink>

            <div className='navButton' onClick={openNav}/>

        </nav>
        </>
    )
}

export default Nav