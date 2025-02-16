// external imports
import React, { useState, useEffect, useRef, Component} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// internal imports
import '../styles/componentSpecific/notebook.scss'

import PageObject from '../interfaces/PageObject';

/*
using notebook component:

a page that is calling notebook should be setup the following way...

2 main component types:
  parentFunction (the component that will be exported)
  childFunctions (contains the content that will be displayed on each page)

parent component should be setup as follows:

  export default function parentFunction() {

    //all global javascript needs to be put here
    const [exampleVariable, setExampleVariable] = useState()
    function exampleFunction() {}

    //continue reading documentation for pageList explanation
    const pageList = [{}]

    //no html should appear in the parent
    return <Notebook pageList={pageList} />
  }

child components are setup as normal components:

  //capitalize the the components name
  function PageName({text, setText, eventHandler}) {
    //standard component rules apply
  }
    
their are 3 props that can be given to Notebook.jsx:
  pageList: an array of json files
  parentPageNumber: a number that will be added to the page number
  requestNewPage: a function that will be called when the last page is reached

the pageList is an array of json files
each json file represents a child component and its props
each json object should be setup as follows:
  {
    import React {useState} from 'react';
import Notebook from "../components/NoteBook";

// this is the main function that is being exported
// this is the function that will calls notebook
export default function MainFunction() {

   // create a use state for testing the component
   const [search, setSearch] = useState('');

   // create a function for testing the component
   function searchDatabase() {
      console.log('searching database for:', search);
   }

   pageList = [
      // JSON object for the page
      {
         content: PageOne,
         props: {
            // pass down the useState
            search: search, 
            setSearch: setSearch,
            //pass down the function
            searchFunction: searchFunction
         }
      }
   ];

   // call the Notebook and make sure to pass pageList 
   return <NoteBook pageList={pageList} />
}

// function containing the content of the page you want to display
function PageOne({ search, setSearch, submitSearch }) {
   // use the props being passed down 
   return (
      <div>
         <input
            value={search} 
            onChange={ (event) => { setSearch(event.target.value) } }
         />
         <button
            value="search database"
            onChange={ () => { submitSearch() } } 
         />
      </div>
   )
}
order of json files in the pageList array will decide the order pages appear on the notebook
*/

interface NotebookProps {
   pageList: PageObject[];
   parentPageNumber?: number;
   requestNewPage?: (pageNumber: number) => void;
}

export default function Notebook ({pageList, parentPageNumber = 0, requestNewPage}: NotebookProps) {

   const [displayRight, setDisplayRight] = useState(false)
   const [narrowScreen, setNarrowScreen] = useState(false)

   const [pageNumber, setPageNumber] = useState(parentPageNumber || 0)
   const FirstPage: PageObject = pageList[pageNumber]
   const SecondPage: PageObject = pageList[pageNumber + 1]

   useEffect(() => {

      // check if the screen is too small to support both pages of notebook at once
      function handleResize() {
         const width = window.innerWidth
         const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
         const threshold = 78 * rootFontSize // 78rem

         if (width < threshold) { setNarrowScreen(true) }
         else { setNarrowScreen(false) }
      }

      handleResize()

      window.addEventListener('resize', handleResize)
      return () => { window.removeEventListener('resize', handleResize) }

   }, [])

   useEffect(() => {

      // changes page if arrow key or a/d is pressed
      function handleKeyDown(event) {
         if (event.target.tagName == 'INPUT' || event.target.tagName == 'TEXTAREA'){ return }
         if (event.key == 'a' || event.key == 'ArrowLeft') { previousPage() }
         if (event.key == 'd' || event.key == 'ArrowRight') { nextPage() }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => { window.removeEventListener('keydown', handleKeyDown) }

   }, [pageNumber, parentPageNumber])

   function previousPage() {
      if ( pageNumber > 0 ) { 
         setPageNumber( pageNumber - 2 ) 
      }
      else if ( (pageNumber + parentPageNumber) > 0 && requestNewPage ) {
         requestNewPage( pageNumber + parentPageNumber - 2 ) 
      }
   }

   function nextPage(){
      if (pageNumber + 2 < (pageList.length)) { 
         setPageNumber(pageNumber + 2) 
      }
      else if (requestNewPage) { 
         requestNewPage( pageNumber + parentPageNumber + 2 ) 
      }
   }

   return(
      <div className={`notebook ${displayRight ? 'displayRight' : ''}`}>
         <div className='notebookPage' onClick={() => setDisplayRight(false)}>
         <div className={`pageContent ${(displayRight && narrowScreen) ? 'shielded' : ''}`}> {FirstPage ? (<FirstPage.content {...FirstPage.props} />) : null} </div>
         <div className='bottomArrows'> 
            <div className='arrowContainer'><FontAwesomeIcon icon={faArrowLeft} onClick={() => previousPage()} /> </div>
            <p>{pageNumber + parentPageNumber + 1}</p>
            <div className='arrowContainer notIntractable'></div>
         </div>
         </div>
         <img className="notebookSpine" src="/notebookSpine.png" alt="notebookSpine" />
         <div className='notebookPage' onClick={() => setDisplayRight(true)}>
         <div className={`pageContent ${(!displayRight && narrowScreen) ? 'shielded' : ''}`}> {SecondPage ? (<SecondPage.content {...SecondPage.props} />) : null} </div>
         <div className='bottomArrows'> 
            <div className='arrowContainer notIntractable'></div>
            <p>{pageNumber+ parentPageNumber +2}</p>
            <div className='arrowContainer'><FontAwesomeIcon icon={faArrowRight} onClick={() => nextPage()}/> </div>
         </div>
         </div>
      </div>
   )
}
