'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
   const [linePosition, setLinePosition] = useState({ x: 0, scale: 0 });

   const redefineLinePosition = useCallback((href: string) => {
      const nav = navRef.current;
      const activeLink = linkRefList.current.get(href);
      if (!nav || !activeLink) { return; }

      const navRectangle = nav.getBoundingClientRect();
      const activeLinkRectangle = activeLink.getBoundingClientRect();

      const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const pixelPadding = 0.3 * remInPx; // This is how many pixels are used to pad one side of a link tag

      setLinePosition({
         x: activeLinkRectangle.left - navRectangle.left + pixelPadding,
         scale: activeLinkRectangle.width - (pixelPadding * 2),
      });
   }, []);

   useEffect(() => {
      redefineLinePosition(pathname);

      let frame = 0;
      const handleResize = () => {
         cancelAnimationFrame(frame);
         frame = requestAnimationFrame(() => redefineLinePosition(pathname));
      }

      window.addEventListener('resize', handleResize);
      return () => { 
         window.removeEventListener('resize', handleResize); 
         cancelAnimationFrame(frame);
      };
   },[pathname, redefineLinePosition]);

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
               { section.map((navigationNode) => (
                  <Link
                     key={navigationNode.name}
                     href={navigationNode.href}
                     ref={(element) => { 
                        if(element) { linkRefList.current.set(navigationNode.href, element); } 
                        else { linkRefList.current.delete(navigationNode.href); }
                     } }
                     onMouseEnter={() => redefineLinePosition(navigationNode.href)}
                     onClick={() => setNavOpen(false)}
                     className={ (pathname === navigationNode.href) ? styles['active-link'] : undefined }
                  >
                     {navigationNode.name}
                  </Link>
               )) }
               </div>
            )) }

            {/* Sliding underline */}
            <span
               aria-hidden="true"
               className={styles.navUnderline}
               style={ { transform: `translateX(${linePosition.x}px) scaleX(${linePosition.scale})` } }
            />
         </nav>

         <ButtonNarrowNav navOpen={ navOpen } onClick={ () => setNavOpen(!navOpen) } />
            
      </header>
   );
}