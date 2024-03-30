import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'

function Nav() {
    
    useEffect(() => {
        fetchItems()
    }, [])

    const [items, setItems] = useState ([])

    const fetchItems = async() => {
        await fetch('server/user/userInfo')
        .then(response => { return response.json() })
        .then(items => {
            console.log(items)
            setItems(items)
        })
    }


    return(
        <>
        {
            items.forEach(item => {
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