'use client'

import React, { useState, useEffect, ComponentPropsWithoutRef, useMemo } from 'react';
import PaginationBar from '@/shared/components/PaginationBar';
import styles from './styles/notebook.module.scss';
import { useSearchParams } from 'next/navigation';
import { StateLoadingInsert } from './stateComponents/Loading.states';
import { BrokenPaginatedListType } from '../shared.types';

interface notebookParams {
   components: BrokenPaginatedListType<React.ReactNode>
}

export default function Notebook ({ components }: notebookParams) {

   useEffect(() => { console.log("components given to notebook:", components); }, [components])

   const searchParams = useSearchParams();
   const groupNumber = Number(searchParams.get('groupNumber')) || 1;

   const currentIndex = useMemo(() => { return (groupNumber - 1) * 2; }, [groupNumber]);

   // set the groupNumber in the url and let the parent catch and handle groupNumber changes
   function setGroupNumber(groupNumber: number) {
      const updatedParams = new URLSearchParams(searchParams.toString())
      updatedParams.set('groupNumber', String(groupNumber));
      window.history.pushState(null, '', `?${ updatedParams.toString() }`);
   }

   function handleSetCurrentIndex(newIndex: number) {
      setGroupNumber((newIndex / 2) + 1);
   }

   function grabPageFromList(index: number) {
      if (components.list[index]) { return components.list[index]; }
      else if (index < components.count) { return <StateLoadingInsert /> }
      else { return undefined; }
   }

   // real index in pageList of the pages being displayed
   const firstPageIndex = currentIndex - components.firstItemIndex;
   const firstPage = grabPageFromList(firstPageIndex);
   const secondPage = grabPageFromList(firstPageIndex + 1);

   function setGroup(newGroup: number) {
      handleSetCurrentIndex((newGroup - 1) * 2);
   }

   const paginationBar = <PaginationBar groupNumber={ Math.ceil((currentIndex + 1) / 2) } groupCount={ Math.ceil(components.count / 2) } setGroupNumber={ setGroup } />;
   return <NotebookView firstPage={ firstPage } secondPage={ secondPage } paginationBar={ paginationBar } />;
}


interface NotebookProps {
   firstPage?: React.ReactNode;
   secondPage?: React.ReactNode;
   paginationBar: React.ReactNode;
}
function NotebookView({firstPage, secondPage, paginationBar}: NotebookProps) {

   // use States that keep track of whether the screen is too narrow to display both pages at once, and if so which page to display
   const [narrowScreen, setNarrowScreen] = useState<boolean>(false);
   const [displayRight, setDisplayRight] = useState<boolean>(false);

      // monitors the screen size and sets narrowScreen accordingly
   useEffect(() => {

      // check if the screen is too small to support both pages of notebook at once
      function handleResize() {
         const width = window.innerWidth;
         const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
         const threshold = 78 * rootFontSize; // 78rem

         if (width < threshold) { setNarrowScreen(true); }
         else { setNarrowScreen(false); }
      }

      handleResize();

      window.addEventListener('resize', handleResize);
      return () => { window.removeEventListener('resize', handleResize); }
   }, []);

   return(
      <div className={styles.notebookContainer}>
         <div className={`${styles.notebook} ${displayRight ? styles.displayRight : ''}`}>
            <div className={`${styles.page} ${(displayRight && narrowScreen) ? 'shielded' : ''}`} onClick={() => setDisplayRight(false)}>
               {firstPage || null}
            </div>
            <img className={ styles.spine } src="/notebookSpine.png" alt="notebookSpine" />
            <div className={`${ styles.page } ${(!displayRight && narrowScreen) ? 'shielded' : ''}`} onClick={() => setDisplayRight(true)}>
               {secondPage || null}
            </div>
         </div>
         {paginationBar}
      </div>
   )
}






export function NotebookPage({ children, className, ...rest }: ComponentPropsWithoutRef<'div'>) {
   
   return (
      <div className={ [styles.NotebookPage, className].filter(Boolean).join(' ') } { ...rest } >
         { children }
      </div>
   );
}