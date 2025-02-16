import React, {useState} from 'react';
import Notebook from "../components/Notebook";

import PageObject from "../interfaces/PageObject";

// this is the main function that is being exported
// this is the function that will calls notebook
export default function MainFunction() {

   // create a use state for testing the component
   const [search, setSearch] = useState<string>('');

   // create a function for testing the component
   function searchFunction() {
      console.log('searching database for:', search);
   }

   const pageList: PageObject[] = [
      // JSON object for the first page
      {
         content: PageOne,
         props: {
            // pass down the useState
            search: search, 
            setSearch: setSearch,
            //pass down the function
            searchFunction: searchFunction
         }
      },
      // JSON object for the second page
      {
         content: PageTwo,
         // this page requires no props, so just pass an empty json object
         props: {}
      },
      // JSON object for the third page
      {
         content: PageThree,
         props: {
            text: "this is the third page"
         }
      }
   ];

   // call the Notebook and make sure to pass pageList 
   return <Notebook pageList={pageList} />
}

interface PageOneProps {
   search: string,
   setSearch: React.Dispatch<React.SetStateAction<string>>,
   searchFunction: () => void
}

function PageOne({ search, setSearch, searchFunction }: PageOneProps) {
   // use the props being passed down 
   return (
      <div>
         <input
            value={search} 
            onChange={ (event) => { setSearch(event.target.value) } }
            placeholder='enter a value'
         />
         <button
            onClick={ () => { searchFunction() } } 
         >
            search database
         </button>
      </div>
   )
}

function PageTwo() {
   // no props given by parent, so lets create our own variables

   // create useStates for testing the component
   const [userInput, setUserInput] = useState<string>('');
   const [text, setText] = useState<string>('');
   // create a function for testing the component
   function searchFunction() {
      setText(userInput);
   }
   return (
      <div>
         <input
            value={userInput} 
            onChange={ (event) => { setUserInput(event.target.value) } }
            placeholder='enter a value'
         />
         <button
            onClick={ () => { searchFunction() } }
         >
            Search value
         </button>
         <p>now searching for: {text}</p>
      </div>
   )
}

interface PageThreeProps { 
   text: string 
}
function PageThree({ text }: PageThreeProps) {
   // display the text given by parent through props
   return (
      <div>
         <h1>Third page</h1>
         <p>{text}</p>
      </div>
   )
}