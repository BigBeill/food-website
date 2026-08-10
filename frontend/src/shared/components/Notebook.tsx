import React, { useState, useEffect } from 'react';
import PaginationBar from '@/shared/components/PaginationBar';
import styles from './styles/notebook.module.scss';
import { useSearchParams } from 'next/navigation';

interface notebookParams {
   children: React.ReactNode;
   childrenCount: number;
   firstChildIndex?: number;
   initialIndex?: number;
}

export default function Notebook ({ children, childrenCount, firstChildIndex = 0, initialIndex = firstChildIndex }: notebookParams) {

   const currentSearchParams = useSearchParams();

   const childArray = React.Children.toArray(children);
   const [currentIndex, setCurrentIndex] = useState<number>(initialIndex || 0);

   // set the groupNumber in the url and let the parent catch and handle groupNumber changes
   function setGroupNumber(groupNumber: number) {
      const updatedParams = new URLSearchParams(currentSearchParams.toString())
      updatedParams.set('groupNumber', String(groupNumber));
      window.history.replaceState(null, '', `?${ updatedParams.toString() }`);
   }

   function handleSetCurrentIndex(newIndex: number) {
      setGroupNumber(newIndex / 2);
      // only change the current index if the content already exists, otherwise wait for parent to react
      if (newIndex >= firstChildIndex && newIndex < (firstChildIndex + childArray.length)) { setCurrentIndex(newIndex); }
   }

   // real index in pageList of the pages being displayed
   const firstPage = childArray[currentIndex - firstChildIndex];
   const secondPage = childArray[currentIndex - firstChildIndex + 1];

   function setGroup(newGroup: number) {
      handleSetCurrentIndex((newGroup - 1) * 2);
   }

   const paginationBar = <PaginationBar groupNumber={ Math.ceil((currentIndex + 1) / 2) } groupCount={ Math.ceil(childrenCount / 2) } setGroupNumber={ setGroup } />;
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