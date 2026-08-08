import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import styles from './styles/paginationBar.module.scss';
import { useEffect } from 'react';


interface PaginationBarProps {
   groupNumber: number;
   groupCount: number;
   setGroupNumber: (index: number) => void;
}

export default function PaginationBar({ groupNumber, groupCount, setGroupNumber }: PaginationBarProps) {

   // guard to try and limit out of bounds requests leaving this component
   function handleGroupChange(newGroupNumber: number) {
      if (newGroupNumber < 1) { setGroupNumber(1); }
      else if (newGroupNumber > groupCount) { setGroupNumber(groupCount); }
      else { setGroupNumber(newGroupNumber); }
   }

   // creates event listener for key presses
   useEffect(() => {
      // changes page if arrow key or a/d is pressed
      function handleKeyDown(event: KeyboardEvent) {
         const focusedElement = (event.target as HTMLElement)?.tagName;
         if (focusedElement === 'INPUT' || focusedElement === 'TEXTAREA') { return; }
         if (event.key == 'a' || event.key == 'ArrowLeft') { handleGroupChange(groupNumber - 1); }
         if (event.key == 'd' || event.key == 'ArrowRight') { handleGroupChange(groupNumber + 1); }
      }

      window.addEventListener('keydown', handleKeyDown);
      return () => { window.removeEventListener('keydown', handleKeyDown); }
   }, [groupNumber, setGroupNumber]);

   return (
      <div className={styles.paginationBar}>
         <button onClick={() => handleGroupChange(groupNumber - 1)} > <FontAwesomeIcon icon={faArrowLeft} /> </button>
         { groupNumber == 4 ? (
            <>
               <button onClick={() => handleGroupChange(1)}> 1 </button>
            </>
         ): groupNumber > 4 ? (
            <>
               <button onClick={() => handleGroupChange(1)}> 1 </button>
               <button onClick={() => handleGroupChange(2)}> 2 </button>
            </>
         ) : null }
         { groupNumber > 5 ? (<p>...</p>) : null}
         { groupNumber > 2 ? (<button onClick={() => handleGroupChange(groupNumber - 2)}> {groupNumber - 2} </button>) : null }
         { groupNumber > 1 ? (<button onClick={() => handleGroupChange(groupNumber - 1)}> {groupNumber - 1} </button>) : null }
         <p className="primaryBlock">{groupNumber}</p>
         { groupNumber < groupCount ?  (<button onClick={() => handleGroupChange(groupNumber + 1)}> {groupNumber + 1} </button>) : null}
         { groupNumber < groupCount - 1 ? (<button onClick={() => handleGroupChange(groupNumber + 2)}> {groupNumber + 2} </button>) : null }
         { groupNumber < groupCount - 4 ? (<p>...</p>) : null}
         { groupNumber == (groupCount - 3)? (
            <>
               <button onClick={() => handleGroupChange(groupCount)}> {groupCount} </button>
            </>
         ) : groupNumber < (groupCount - 3)? (
            <>
              <button  onClick={() => handleGroupChange(groupCount - 1)}> {groupCount - 1} </button>
              <button onClick={() => handleGroupChange(groupCount)}> {groupCount} </button> 
            </>
         ) : null}
         <button onClick={() => handleGroupChange(groupNumber + 1)} > <FontAwesomeIcon icon={faArrowRight} /> </button>
      </div>
   )
}