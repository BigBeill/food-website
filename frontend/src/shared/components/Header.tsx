'use client'

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/features/auth/hooks/useAuth';
import styles from './styles/header.module.scss';
import { ButtonNarrowNav } from './Button.components';

interface NavigationNodeType {
   name: string,
   href: string,
}

export default function Header() {

   const { authId } = useAuth();

   const navigation = useMemo<NavigationNodeType[][]>(() => [
      [
            { name: 'Home', href: '/' },
            { name: 'Find Recipes', href: '/recipes/search/public' },
            ...(authId ? [{ name: 'My Recipes', href: '/recipes/search/personal' }] : []),
            { name: 'Ingredients', href: '/ingredients' },
            { name: 'About Project', href: '/about' },
         ],
         [
            ...(authId
            ? [{ name: 'Profile', href: `/users` }]
            : [
               { name: 'Login', href: '/auth/login' },
               { name: 'Register', href: '/auth/register' },
            ]),
         ]
   ], [authId]);

   const [navOpen, setNavOpen] = useState(false);
   const pathname = usePathname();

   const navRef = useRef<HTMLElement | null>(null);
   const linkRefList = useRef(new Map<string, HTMLAnchorElement | null>());
   const [linePosition, setLinePosition] = useState({ left: 0, width: 0 }); // this is relative the location the line would have started at when page loaded

   function redefineLinePosition(href: string) {
      const nav = navRef.current;
      const activeLink = linkRefList.current.get(href);
      if (!nav || !activeLink) { return; }

      const navRectangle = nav.getBoundingClientRect();
      const activeLinkRectangle = activeLink.getBoundingClientRect();

      const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const pixelPadding = 0.75 * remInPx; // This is how many pixels are used to pad one side of a link tag

      setLinePosition({
         left: activeLinkRectangle.left - navRectangle.left + pixelPadding,
         width: activeLinkRectangle.width - (pixelPadding * 2),
      })
   }

   useEffect(() => {
      redefineLinePosition(pathname)
      const handleResize = () => redefineLinePosition(pathname);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   },[pathname]);

   return (
      <header className={ styles.header }>

         {/* Navigation */}
         <nav
            ref={navRef} 
            className={`${styles.nav} ${navOpen ? styles.visible : ''}`}
            onMouseLeave={() => redefineLinePosition(pathname)}
            >

            { navigation.map((section, index) => (
               <div key={ index }>
               { section.map((navigationNode, index) => (
                  <Link
                     key={navigationNode.name}
                     href={navigationNode.href}
                     ref={(element) => { linkRefList.current.set(navigationNode.href, element); }}
                     onMouseEnter={() => redefineLinePosition(navigationNode.href)}
                     onClick={() => setNavOpen(false)}
                     className={(pathname === navigationNode.href) ? "active-link" : ""}
                  >
                     {navigationNode.name}
                  </Link>
               )) }
               </div>
            )) }

            {/* Sliding underline */}
            <div
               className={styles.navUnderline}
               style={ { left: `${linePosition.left}px`, width: `${linePosition.width}px` } }
            />
         </nav>

         <ButtonNarrowNav navOpen={ navOpen } onClick={ () => setNavOpen(!navOpen) } />

      </header>
   );
}