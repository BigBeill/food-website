import { useState, useEffect } from 'react';

import '../styles/componentSpecific/notebook.scss';
import PageObject from '../interfaces/PageObject';
import PaginationBar from './PaginationBar';

// LOOK AT README.MD FILE IN THE ROOT FOLDER FOR INSTRUCTIONS ON HOW TO USE THIS COMPONENT

interface NotebookProps {
   pageList: PageObject[];
   startingPageNumber?: number; // the page number of the first page in the pageList, defaults to 1
   parentPageNumber?: number; // the page number that the parent component thinks is currently being displayed, defaults to startingPageNumber
   setParentPageNumber?: (pageNumber: number) => void; // provide this if you want notebook to change the parents page number when it navigates to a different page
   requestNewPage?: (pageNumber: number) => void;
   pageCount?: number;
}

export default function Notebook ({
   pageList, 
   startingPageNumber=1, 
   parentPageNumber = startingPageNumber, 
   setParentPageNumber, 
   requestNewPage, 
   pageCount = pageList.length
}: NotebookProps) {

   // use States that keep track of whether the screen is too narrow to display both pages at once, and if so which page to display
   const [narrowScreen, setNarrowScreen] = useState<boolean>(false);
   const [displayRight, setDisplayRight] = useState<boolean>(false);

   // useState that keeps track of the index of the current page being looked at
   const [currentIndex, setCurrentIndex] = useState<number>(parentPageNumber - startingPageNumber);

   // useEffect that monitors the screen size and sets narrowScreen accordingly
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

   // useEffect that keeps the parent component up to date with what page the notebook is on (assuming setParentPageNumber is provided)
   useEffect(() => {
      if (setParentPageNumber) { setParentPageNumber(currentIndex + startingPageNumber); }
   }, [currentIndex]);

   // useEffect that creates event listener for key presses
   useEffect(() => {
      // changes page if arrow key or a/d is pressed
      function handleKeyDown(event: KeyboardEvent) {
         if (event.target && (event.target as HTMLElement).tagName == 'INPUT' || (event.target as HTMLElement).tagName == 'TEXTAREA'){ return; }
         if (event.key == 'a' || event.key == 'ArrowLeft') { previousPage(); }
         if (event.key == 'd' || event.key == 'ArrowRight') { nextPage(); }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => { window.removeEventListener('keydown', handleKeyDown) }
   }, [currentIndex, startingPageNumber, parentPageNumber]);

   // indexes for the actual pages being displayed
   const firstPage = pageList[currentIndex];
   const secondPage = pageList[currentIndex + 1];

   // pages are grouped into pairs, so changing the grouping by 1 changes the page index by 2 
   function handleGroupingChange(newGrouping: number) {
      handlePageChange(((newGrouping - 1) * 2) - (startingPageNumber - 1));
   }

   function handlePageChange(newPageIndex: number) {
      console.log("Changing page index to:", newPageIndex);
      // check if the pageIndex being requested is out of bounds
      if (newPageIndex < 0) {
         // page index is too low to be valid, request page indexed globally as 0
         if (newPageIndex + startingPageNumber < 1) { handlePageChange(1 - startingPageNumber); }
         // pageIndex is valid, but out of bounds for the current pageList
         else if (requestNewPage) { requestNewPage(newPageIndex + startingPageNumber); }
         // if requestNewPage is not provided, setIndex to 0
         else { setCurrentIndex(0); }
      }
      else if (newPageIndex >= pageList.length) {
         // page index is too high to be valid, request page with the highest valid index
         if ((newPageIndex + startingPageNumber) > (pageCount + 1)) { handlePageChange(pageCount - 1); }
         // pageIndex is valid, but out of bounds for the current pageList
         else if (requestNewPage) { requestNewPage(newPageIndex + startingPageNumber); }
         // if requestNewPage is not provided, setIndex to the highest pageList index
         else { setCurrentIndex(pageList.length - 1); }
      }
      // if newPageIndex is in bounds of pageList, set it
      else { setCurrentIndex(newPageIndex); }
   }

   function previousPage() {
      if ( currentIndex + startingPageNumber > 2 ) { handlePageChange( currentIndex - 2 ); }
      else if ( currentIndex + startingPageNumber > 1 ) { handlePageChange( parentPageNumber - 1 ); }
   }

   function nextPage(){
      if (currentIndex + startingPageNumber < pageCount - 1) { handlePageChange( currentIndex + 2 ); }
   }

   return(
      <div className="notebookContainer">
         <div className={`notebook ${displayRight ? 'displayRight' : ''}`}>
            <div className={`notebookPage ${(displayRight && narrowScreen) ? 'shielded' : ''}`} onClick={() => setDisplayRight(false)}>
               {firstPage ? (<firstPage.content {...firstPage.props} />) : null}
            </div>
            <img className="notebookSpine" src="/notebookSpine.png" alt="notebookSpine" />
            <div className={`notebookPage ${(!displayRight && narrowScreen) ? 'shielded' : ''}`} onClick={() => setDisplayRight(true)}>
               {secondPage ? (<secondPage.content {...secondPage.props} />) : null}
            </div>
         </div>
         <PaginationBar currentPage={Math.ceil((currentIndex + startingPageNumber) / 2)} totalPages={Math.ceil(pageCount / 2)} requestNewPage={handleGroupingChange} />
      </div>
   )
}
