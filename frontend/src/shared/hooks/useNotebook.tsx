import React, { useState, useEffect } from 'react';
import PaginationBar from '@/shared/components/PaginationBar';
import styles from './styles/notebook.module.scss';
import { PaginatedListType } from '../shared.types';
import { ErrorNotFound } from '../lib/errorClasses';
import { useServiceMutation } from './useServiceMutation';

interface useNotebookParams {
   requestOutOfBoundsIndex?: (groupNumber: number) => Promise<PaginatedListType<React.ReactNode>>;
}

export default function useNotebook (initialPaginatedPages: PaginatedListType<React.ReactNode>, { requestOutOfBoundsIndex }: useNotebookParams) {

   const getOutOfBoundsIndex = useServiceMutation((index: number) => {
      if (!requestOutOfBoundsIndex) { throw new ErrorNotFound(); }
      return requestOutOfBoundsIndex(index);
   });

   const [paginatedPages, setPaginatedPages] = useState<PaginatedListType<React.ReactNode>>(initialPaginatedPages);
   const [currentIndex, setCurrentIndexDirect] = useState<number>(paginatedPages.firstItemIndex || 0);

   async function setCurrentIndex(newIndex: number) {
      if (newIndex < (paginatedPages.firstItemIndex || 0) || newIndex > paginatedPages.list.length + (paginatedPages.firstItemIndex || 0)) {
         try { 
            const newList = await getOutOfBoundsIndex.send(newIndex);
            setPaginatedPages(newList);
            setCurrentIndex(newIndex);
         }
         catch (error) { console.warn("notebook is attempting to access content that may not exist"); }
      }
      else { setCurrentIndexDirect(newIndex); }
   }

   function overridePaginatedPages(newList: PaginatedListType<React.ReactNode>, { currentIndex = newList.firstItemIndex || 0 }: { currentIndex: number }) {
      setPaginatedPages(newList);
      setCurrentIndex(currentIndex);
   }

   // real index in pageList of the pages being displayed
   const firstPage = paginatedPages.list[currentIndex - (paginatedPages.firstItemIndex || 0)];
   const secondPage = paginatedPages.list[currentIndex - (paginatedPages.firstItemIndex || 0) + 1];

   function setGroup(newGroup: number) {
      setCurrentIndex((newGroup - 1) * 2);
   }

   const paginationBar = <PaginationBar groupNumber={ Math.ceil((currentIndex + 1) / 2) } groupCount={ Math.ceil(paginatedPages.count / 2) } setGroupNumber={ setGroup } />;
   const htmlView = <NotebookView firstPage={ firstPage } secondPage={ secondPage } paginationBar={ paginationBar } />;

   return { 
      htmlView: htmlView,
      overridePaginatedPages,
   };
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