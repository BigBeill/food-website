import React, { useState, useEffect, useRef, Component} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import ActiveSearchBar from '../components/ActiveSearchBar'
import NoteBook from '../components/NoteBook';

function newEditRecipe () {
  const [displayRight, setDisplayRight] = useState(false)
  const [textBox, setTextBox] = useState('test')

  const pageList = [
    {
      name: Page1,
      props: {
        text: textBox
      }
    },
    { 
      name: Page2,
      props: {
        
      }
    },
    { 
      name: Page3,
      props: {
        
      }
    },
    { 
      name: Page4,
      props: {
        
      }
    },
  ]

  return <NoteBook pageList={pageList}/>
}

function Page1 ({text}) {
  return (
    <>
      <p>page one {text}</p>
    </>
  )
}

function Page2 () {
  return (
    <>
      <p>page two</p>
    </>
  )
}

function Page3 () {
  return (
    <>
      <p>page three</p>
    </>
  )
}

function Page4 () {
  return (
    <>
      <p>page four</p>
    </>
  )
}

export default newEditRecipe