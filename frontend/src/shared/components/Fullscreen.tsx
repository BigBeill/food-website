"use client"

import styles from './styles/fullscreen.module.scss'
import { useEffect, useState } from "react";

type ComponentParams = React.ComponentPropsWithoutRef<'div'> & {
   condition: boolean;
   onExit: () => void;
}

export function Fullscreen({ condition, onExit, children, className, ...rest }: ComponentParams) {
   const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

   useEffect(() => {
      setPortalRoot(document.getElementsByTagName('body')[0]);

      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { onExit(); }  };
      window.addEventListener('keydown', onKey);
      return () => {
         window.removeEventListener('keydown', onKey);
         document.body.style.overflow = prev;
      };
   }, [onExit])

   if (!portalRoot) { return null; }

   return (
      <div className={ styles.fullscreenWrapper } role="dialog" aria-modal="true" onClick={() => { onExit() } }>
         <div className={ [styles.fullscreenComponent, className].filter(Boolean).join(' ') }>
            { children }
         </div>
      </div>
   )
}