import React, { useState, useEffect, useRef, Component} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

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

the pageList is an array of json files
each json file represents a child component and its props
each json object should be setup as follows:
  {
    name: PageName,
    props: {
      //any prop you want to send to the child (childNameForProp: parentNameForProp)
      text: exampleVariable,
      setText: setExampleVariable,
      eventHandler: exampleFunction
    }
  }
order of json files in the pageList array will decide the order pages appear on the notebook
*/

export default function NoteBook ({pageList, parentPageNumber, RequestNewPage}) {

  const [displayRight, setDisplayRight] = useState(false)
  const [narrowScreen, setNarrowScreen] = useState(false)

  const [pageNumber, setPageNumber] = useState(parentPageNumber || 0)
  const FirstPage = pageList[pageNumber]
  const SecondPage = pageList[pageNumber + 1]

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

  function previousPage() {
    if (parentPageNumber){
      if ( pageNumber > parentPageNumber ) { setPageNumber( pageNumber - 2 ) }
      else { RequestNewPage( pageNumber - 2 ) }
    }
    else {
      if (pageNumber > 0) { setPageNumber(pageNumber - 2) }
    }
  }

  function nextPage(){
    if (parentPageNumber) {
      if (pageNumber + 2 < (pageList.length + parentPageNumber)) { setPageNumber(pageNumber + 2) }
      else { RequestNewPage( pageNumber + 2 ) }
    }
    else {
      if (pageNumber + 2 < pageList.length) { setPageNumber(pageNumber + 2) }
    }
  }

  return(
    <div className={`notebook ${displayRight ? 'displayRight' : ''}`}>
      <div className='notebookPage' onClick={() => setDisplayRight(false)}>
        <div className={`pageContent ${(displayRight && narrowScreen) ? 'shielded' : ''}`}> {FirstPage ? (<FirstPage.name {...FirstPage.props} />) : null} </div>
        <div className='bottomArrows'> 
          <div className='arrowContainer'><FontAwesomeIcon icon={faArrowLeft} onClick={() => previousPage()} /> </div>
          <p>{pageNumber+1}</p>
          <div className='arrowContainer notIntractable'></div>
        </div>
      </div>
      <img className="notebookSpine" src="/notebookSpine.png" alt="notebookSpine" />
      <div className='notebookPage' onClick={() => setDisplayRight(true)}>
        <div className={`pageContent ${(!displayRight && narrowScreen) ? 'shielded' : ''}`}> {SecondPage ? (<SecondPage.name {...SecondPage.props} />) : null} </div>
        <div className='bottomArrows'> 
          <div className='arrowContainer notIntractable'></div>
          <p>{pageNumber+2}</p>
          <div className='arrowContainer'><FontAwesomeIcon icon={faArrowRight} onClick={() => nextPage()}/> </div>
        </div>
      </div>
    </div>
  )
}