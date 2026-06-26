import { useState, useEffect } from 'react';

import '../styles/componentSpecific/notebook.scss';
import PaginationBar from '@/shared/components/PaginationBar';

import notebookStyles from './notebook.module.scss';

// LOOK AT README.MD FILE IN THE ROOT FOLDER FOR INSTRUCTIONS ON HOW TO USE THIS COMPONENT

// Notebook will call this function if it needs access to a page that it does not currently have access to. requestedIndex will be set to the index of the page it is trying to display to the user.
export default function useNotebook (requestOutOfBoundsIndex?: (requestedIndex: number) => Promise<void>) {

   const [componentList, setComponentList] = useState<React.ReactNode[]>([]);
   const [componentCount, setComponentCount] = useState<number>(0);
   const [firstItemIndex, setFirstItemIndex] = useState<number>(0);
   const [currentIndex, setCurrentIndex] = useState<number>(0);

   // Notebook assumes that the page at index 0 is a menu page and thus will not assign it a page number. If the first page must be assigned a page number, set initialPageIndex to 1
   function replaceComponentList(componentList: React.ReactNode[], 
      {
         newComponentCount = componentList.length, 
         firstItemIndex = 0, 
         showIndex = firstItemIndex
      }: { 
         newComponentCount?: number; 
         showIndex?: number; 
         firstItemIndex?: number 
      } = {}) {
      setComponentList(componentList);
      setComponentCount(newComponentCount);
      setFirstItemIndex(firstItemIndex);
      setCurrentIndex(showIndex);
   }

   function appendComponentList(newComponents: React.ReactNode[], 
      {
         newComponentCount, 
         firstItemIndex, 
         showIndex, 
         addToBeginning = false
      }: { 
         newComponentCount?: number, 
         firstItemIndex?: number, 
         showIndex?: number, 
         addToBeginning?: boolean
      } = {}) {
      if (addToBeginning) { setComponentList([...newComponents, ...componentList]); }
      else { setComponentList([...componentList, ...newComponents]); }

      if (newComponentCount) { setComponentCount(newComponentCount); }
      else {
         const updatedListCount = componentList.length + newComponents.length;
         if (updatedListCount < componentCount) { setComponentCount(updatedListCount); }
      }

      if (firstItemIndex) { setFirstItemIndex(firstItemIndex); }
      if (showIndex) { setCurrentIndex(showIndex); }
   }

   useEffect(() => {
      // request page from requestOutOfBoundsIndex not already provided in pageList
      if ((currentIndex < firstItemIndex || currentIndex > (componentList.length + firstItemIndex)) && requestOutOfBoundsIndex) {
         requestOutOfBoundsIndex(currentIndex);
      }
   }, [currentIndex]);

   // creates event listener for key presses
   useEffect(() => {
      // changes page if arrow key or a/d is pressed
      function handleKeyDown(event: KeyboardEvent) {
         const focusedElement = (event.target as HTMLElement)?.tagName;
         if (focusedElement === 'INPUT' || focusedElement === 'TEXTAREA') { return; }
         if (event.key == 'a' || event.key == 'ArrowLeft') { previousPage(); }
         if (event.key == 'd' || event.key == 'ArrowRight') { nextPage(); }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => { window.removeEventListener('keydown', handleKeyDown) }
   }, [currentIndex, componentCount]);

   // real index in pageList of the pages being displayed
   const firstPage = componentList[currentIndex - firstItemIndex];
   const secondPage = componentList[(currentIndex - firstItemIndex) + 1];

   // pages are grouped into pairs, so changing the grouping by 1 changes the page index by 2 
   function handleGroupingChange(newGrouping: number) {
      handlePageChange((newGrouping - 1) * 2);
   }

   function handlePageChange(newPageIndex: number) {
      // check if the pageIndex being requested is out of bounds
      if (newPageIndex > componentCount) { 
         handlePageChange(componentCount);
         return;
      }
      if (newPageIndex < 0) { 
         handlePageChange(0);
         return;
      }

      setCurrentIndex(0);
   }

   function previousPage() {
      handlePageChange(currentIndex - 2);
   }

   function nextPage(){
      handlePageChange(currentIndex + 2);
   }

   const paginationBar = <PaginationBar currentPage={Math.ceil((currentIndex + 1) / 2)} totalPages={Math.ceil(componentCount / 2)} requestNewPage={handleGroupingChange} />;
   const notebook = <Notebook firstPage={firstPage} secondPage={secondPage} paginationBar={paginationBar} />;

   return { content: notebook, replaceComponentList, appendComponentList, currentIndex };
}

interface NotebookProps {
   firstPage?: React.ReactNode;
   secondPage?: React.ReactNode;
   paginationBar: React.ReactNode;
}
function Notebook({firstPage, secondPage, paginationBar}: NotebookProps) {

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
      <div className={notebookStyles.notebookContainer}>
         <div className={`notebook ${displayRight ? 'displayRight' : ''}`}>
            <div className={`notebookPage ${(displayRight && narrowScreen) ? 'shielded' : ''}`} onClick={() => setDisplayRight(false)}>
               {firstPage || null}
            </div>
            <img className="notebookSpine" src="/notebookSpine.png" alt="notebookSpine" />
            <div className={`notebookPage ${(!displayRight && narrowScreen) ? 'shielded' : ''}`} onClick={() => setDisplayRight(true)}>
               {secondPage || null}
            </div>
         </div>
         {paginationBar}
      </div>
   )
}