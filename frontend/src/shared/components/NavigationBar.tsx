'use client'

import { useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/features/auth/hooks/useAuth';
import Image from 'next/image';
import styles from './NavigationBar.module.scss';
import { ButtonNavigationBar } from './Buttons';

function NavigationBar() {
   const [open, setOpen] = useState<boolean>(false);
   const navRef = useRef<HTMLDivElement>(null);
   const pathname = usePathname();
   const { authId } = useAuth();
   
   function toggleOpen() {
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
      <nav aria-label="Main Navigation" ref={navRef} className={`${styles.customNavigationBar} ${open ? styles.open : ''}`} id="navigationBar" tabIndex={-1}>
         <Link
            href="/"
            className={styles.logo}
            onClick={() => setOpen(false)}
         >
            <Image
               src="/BigBeill-logo_black.png" 
               alt="Beill's Greenhouse Logo - Return to home page" 
               width={500}
               height={500}
               style={{ width: '100%', height: 'auto' }}
            />
         </Link>

         <section aria-labelledby="findRecipesHeading">
            <h3 id="findRecipesHeading">Find Recipes</h3>
            <NavItem href="/searchRecipes/public">Public Recipes</NavItem>
            { authId && (
               <NavItem href="/searchRecipes/friends">Friends Recipes</NavItem>
            )}
         </section>

         { authId && (
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
            { authId ? (
               <NavItem href="/profile">Profile</NavItem>
            ):(
               <>
                  <NavItem href="/auth/login">Login</NavItem>
                  <NavItem href="/auth/register">Create Account</NavItem>
               </>
            )}
         </section>

         <section aria-labelledby="infoHeading">
            <h3 id="infoHeading">Info</h3>
            <NavItem href="/ingredients">Ingredients List</NavItem>
            <NavItem href="/aboutMe">About Me</NavItem>
         </section>

         <ButtonNavigationBar isOpen={open} onClick={toggleOpen} />
      </nav>
   )
}

export default NavigationBar