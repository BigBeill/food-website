'use client'

import { useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Image from 'next/image';

function Nav() {
   const [open, setOpen] = useState<boolean>(false);
   const navRef = useRef<HTMLDivElement>(null);
   const pathname = usePathname();
   const { userId } = useAuth();
   
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
   }, [open]);

   function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
      return (
         <Link
            href={href}
            className={pathname === href ? 'active' : ''}
            onClick={() => setOpen(false)}
         >
            {children}
         </Link>
      );
   }

   return(
      <nav aria-label="Main Navigation" ref={navRef} className={`navBar ${open ? 'open' : ''}`} id="navBar" tabIndex={-1}>
         <Link
            href="/"
            className="logo"
            onClick={() => setOpen(false)}
         >
            <Image 
               src="/BigBeill-logo_black.png" 
               alt="Beill's Greenhouse Logo - Return to home page" 
               fill
            />
         </Link>

         <section aria-labelledby="findRecipesHeading">
            <h3 id="findRecipesHeading">Find Recipes</h3>
            <NavItem href="/searchRecipes/public">Public Recipes</NavItem>
            { userId && (
               <NavItem href="/searchRecipes/friends">Friends Recipes</NavItem>
            )}
         </section>

         { userId && (
            <>
               <section aria-labelledby="yourRecipesHeading">
                  <h3 id="yourRecipesHeading">Your Recipes</h3>
                  <NavItem href="/searchRecipes/personal">My Recipes</NavItem>
                  <NavItem href="/index">Saved Recipes</NavItem>
                  <NavItem href="/editRecipe">Create Recipe</NavItem>
               </section>

               <section aria-labelledby="socialHeading">
                  <h3 id="socialHeading">Social</h3>
                  <NavItem href="/searchUser/friends">My Friends</NavItem>
                  <NavItem href="/searchUser/all">Search Users</NavItem>
               </section>
            </>
         )}

         <section aria-labelledby="accountHeading">
            <h3 id="accountHeading">Account</h3>
            { userId ? (
               <NavItem href="/profile">Profile</NavItem>
            ):(
               <>
                  <NavItem href="/login">Login</NavItem>
                  <NavItem href="/register">Create Account</NavItem>
               </>
            )}
         </section>

         <section aria-labelledby="infoHeading">
            <h3 id="infoHeading">Info</h3>
            <NavItem href="/ingredients">Ingredients List</NavItem>
            <NavItem href="/aboutMe">About Me</NavItem>
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