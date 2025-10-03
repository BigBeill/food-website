// external imports
import { useState, useEffect, useRef} from 'react'

// internal imports
import '../styles/componentSpecific/nav.scss'
import { NavLink } from "react-router-dom";

interface NavProps {
    userId: string | null;
}

function Nav({userId}: NavProps) {
    const [open, setOpen] = useState<boolean>(false);
    const navRef = useRef<HTMLDivElement>(null);
    
    // open/close the nav bar whenever the handle on the side of the nav panel is clicked
    function openNav() {
        setOpen(!open);
    }

    // close the nav bar whenever the user clicks outside of it
    function handleOutsideClick(event: MouseEvent) {
        if (navRef.current && !navRef.current.contains(event.target as Node)) {
            setOpen(false);
        }
    }

    // detect a click outside the nav bar
    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => { document.removeEventListener("mousedown", handleOutsideClick); }
    }, []);

    useEffect(() => {
        if (open && navRef.current) {
            const firstLink = navRef.current.querySelector('a, button');
            (firstLink as HTMLElement)?.focus();
        }
    }, [open])

    return(
        <nav aria-label="Main Navigation" ref={navRef} className={`navBar ${open ? 'open' : ''}`} id="navBar" tabIndex={-1}>
            <NavLink className="logo" to="/">
                <img src="/BigBeill-logo_black.png" alt="Beill's Greenhouse Logo - Return to home page" />
            </NavLink>

            <section aria-labelledby="findRecipesHeading">
                <h3 id="findRecipesHeading">Find Recipes</h3>
                <NavLink to="/searchRecipes/public" onClick={() => setOpen(false)}>Public Recipes</NavLink>
                { userId && (
                    <NavLink to="/searchRecipes/friends" onClick={() => setOpen(false)}>Friends Recipes</NavLink>
                )}
            </section>
            { userId && (
                <>
                    <section aria-labelledby="yourRecipesHeading">
                        <h3 id="yourRecipesHeading">Your Recipes</h3>
                        <NavLink to="/searchRecipes/personal" onClick={() => setOpen(false)}>My Recipes</NavLink>
                        <NavLink to="/index" onClick={() => setOpen(false)}>Saved Recipes</NavLink>
                        <NavLink to="/editRecipe" onClick={() => setOpen(false)}>Create Recipe</NavLink>
                    </section>

                    <section aria-labelledby="socialHeading">
                        <h3 id="socialHeading">Social</h3>
                        <NavLink to="/searchUser/friends" onClick={() => setOpen(false)}>My Friends</NavLink>
                        <NavLink to="/searchUser/all" onClick={() => setOpen(false)}>Search Users</NavLink>
                    </section>
                </>
            )}

            <section aria-labelledby="accountHeading">
                <h3 id="accountHeading">Account</h3>
                { userId ? (
                    <NavLink to="/profile" onClick={() => setOpen(false)}>Profile</NavLink>
                ):(
                    <>
                        <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
                        <NavLink to="/register" onClick={() => setOpen(false)}>Create Account</NavLink>
                    </>
                )}
            </section>

            <section aria-labelledby="infoHeading">
                <h3 id="infoHeading">Info</h3>
                <NavLink to="/ingredients" onClick={() => setOpen(false)}>Ingredients List</NavLink>
                <NavLink to="/aboutMe" onClick={() => setOpen(false)}>About Me</NavLink>
            </section>

            <button className='navButton' onClick={openNav} aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="navBar">
                <div className={`hamburgerButton ${open ? 'open' : ''}`} aria-hidden="true">
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </button>

        </nav>
    )
}

export default Nav