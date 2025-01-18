import React, {useState} from 'react';
import Notebook from "../components/Notebook";

// this is the main function that is being exported
// this is the function that will calls notebook
export default function MainFunction() {

   // create a use state for testing the component
   const [search, setSearch] = useState('');

   // create a function for testing the component
   function searchFunction() {
      console.log('searching database for:', search);
   }

   const pageList = [
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

function PageOne({ search, setSearch, searchFunction }) {
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
   const [userInput, setUserInput] = useState('');
   const [text, setText] = useState('');
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

function PageThree({ text }) {
   // display the text given by parent through props
   return (
      <div>
         <h1>Third page</h1>
         <p>{text}</p>
      </div>
   )
}