import React from 'react'
import './Header.css'

const Header = () => {
    return (
        <header className='header'>
            <div className='header-contents'>
                <h2>Order Your Favourite Food Here</h2>
                <p style={{backgroundColor:"#000"}}>
                    Choose from a diverse menu featuring a delectable array of dishes
                    crafted with the finest ingredients and culinary expertise.
                </p>
                <button aria-label="View our full menu">View Menu</button>
            </div>
        </header>
    )
}

export default Header
