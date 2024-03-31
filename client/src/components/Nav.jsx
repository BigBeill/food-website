import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'

function Nav() {
    
    useEffect(() => {
        fetchItems()
    }, [])

    const [items, setItems] = useState ([])

    const fetchItems = async() => {
        await fetch('server/user/userInfo')
        .then(response => response.json() )
        .then(data => {setItems([data])})
    }


    return(
        <>
        <nav className="navBar" id="navBar">
            {items.map((item, index) => (
                <>
                    {console.log(item)}
                    <div>testing</div>
                    <div>{item.messageOne}</div>
                    <div>{item.messageTwo}</div>
                </>
            ))

            }

            
            <h3>Find Recipes</h3>
            <a href="/index">Public</a>
            <a href="/index">Following</a>
            <a href="/index">Search</a>

        </nav>
        </>
    )
}

export default Nav;