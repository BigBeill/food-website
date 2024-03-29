import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'

function Nav() {
    
    useEffect(() => {
        fetchItems()
    }, [])

    const [items, setItems] = useState ([])

    const fetchItems = async() => {
        const data = await fetch('/user/data')
    }


    return(
        <nav className="navBar" id="navBar">

            <h3>Find Recipes</h3>
            <a href="/index">Public</a>
            <a href="/index">Following</a>
            <a href="/index">Search</a>

        </nav>
    )
}

export default Nav;