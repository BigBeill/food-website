import React, { useState, useEffect, useRef, Component} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, prefix } from '@fortawesome/free-solid-svg-icons';

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

export default function noteBook ({pageList}) {
  const [displayRight, setDisplayRight] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const FirstPage = pageList[pageNumber]
  const SecondPage = pageList[pageNumber + 1]

  function previousPage() {
    if (pageNumber > 0) { setPageNumber(pageNumber - 2) }
  }

  function nextPage(){
    if (pageNumber + 2 < pageList.length) { setPageNumber(pageNumber + 2) }
  }

  return(
    <div className={`notebook ${displayRight ? 'displayRight' : ''}`}>
      <div className='notebookPage' onClick={() => setDisplayRight(false)}>
        <FirstPage.name {...FirstPage.props}/> 
        <div className='arrowIcon left'><FontAwesomeIcon icon={faArrowLeft} className='arrow' onClick={() => previousPage()} /></div>
      </div>
      <img className="notebookSpine" src="/notebookSpine.png" alt="notebookSpine" />
      <div className='notebookPage' onClick={() => setDisplayRight(true)}>
        <SecondPage.name {...SecondPage.props}/>
        <div className='arrowIcon right'><FontAwesomeIcon icon={faArrowRight} className='arrow' onClick={() => nextPage()}/></div>
      </div>
    </div>
  )
}