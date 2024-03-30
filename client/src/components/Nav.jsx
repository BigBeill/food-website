import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'

function Nav() {
    
    useEffect(() => {
        fetchItems()
    }, [])

    const [items, setItems] = useState ([])

    const fetchItems = async() => {
        console.log("test")
        const data = await fetch('api/user/data')
        .then(response => console.log(response))
        console.log("test2")
        const items = await data.json()
        console.log("test3")
        setItems(items)
    }


    return(
        <>
        {
            items.map(item => {
                <div>
                    <p>{item.messageOne}</p>
                    <p>{item.messageTwo}</p>
                </div>
            })
        }

        <nav className="navBar" id="navBar">

            <h3>Find Recipes</h3>
            <a href="/index">Public</a>
            <a href="/index">Following</a>
            <a href="/index">Search</a>

        </nav>
        </>
    )
}

export default Nav;