import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import './nav.css'

function Nav(data) {
    console.log("building the nav bar")
    console.log(data.userData)

    return(
        <>
        <nav className="navBar" id="navBar">

        <h3>Find Recipes</h3>
        <a href="/">Public</a>
        <a href="/index">Following</a>
        <a href="/index">Search</a>

        {   
            data.userData.length != 0 ?
            <>

            <h3>Your Recipes</h3>
            <a href="/index">Personal</a>
            <a href="/index">Saved</a>
            <a href="/createRecipe">New Recipe</a>

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

        </nav>
        </>
    )
}

export default Nav