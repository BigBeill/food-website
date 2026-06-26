import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import paginationBarStyles from './paginationBar.module.scss';


interface PaginationBarProps {
   currentGroup: number;
   totalGroups: number;
   requestNewGroup: (page: number) => void;
}

export default function PaginationBar({ currentGroup, totalGroups, requestNewGroup }: PaginationBarProps) {

   function handlePageChange(newPage: number) {
      if (newPage < 1 || newPage > totalGroups) { return; }
      requestNewGroup(newPage);
   }

   return (
      <div className={paginationBarStyles.paginationBar}>
         <button onClick={() => handlePageChange(currentGroup - 1)} > <FontAwesomeIcon icon={faArrowLeft} /> </button>
         { currentGroup == 4 ? (
            <>
               <button onClick={() => handlePageChange(1)}> 1 </button>
            </>
         ): currentGroup > 4 ? (
            <>
               <button onClick={() => handlePageChange(1)}> 1 </button>
               <button onClick={() => handlePageChange(2)}> 2 </button>
            </>
         ) : null }
         { currentGroup > 5 ? (<p>...</p>) : null}
         { currentGroup > 2 ? (<button onClick={() => handlePageChange(currentGroup - 2)}> {currentGroup - 2} </button>) : null }
         { currentGroup > 1 ? (<button onClick={() => handlePageChange(currentGroup - 1)}> {currentGroup - 1} </button>) : null }
         <p className="primaryBlock">{currentGroup}</p>
         { currentGroup < totalGroups ?  (<button onClick={() => handlePageChange(currentGroup + 1)}> {currentGroup + 1} </button>) : null}
         { currentGroup < totalGroups - 1 ? (<button onClick={() => handlePageChange(currentGroup + 2)}> {currentGroup + 2} </button>) : null }
         { currentGroup < totalGroups - 4 ? (<p>...</p>) : null}
         { currentGroup == (totalGroups - 3)? (
            <>
               <button onClick={() => handlePageChange(totalGroups)}> {totalGroups} </button>
            </>
         ) : currentGroup < (totalGroups - 3)? (
            <>
              <button  onClick={() => handlePageChange(totalGroups - 1)}> {totalGroups - 1} </button>
              <button onClick={() => handlePageChange(totalGroups)}> {totalGroups} </button> 
            </>
         ) : null}
         <button onClick={() => handlePageChange(currentGroup + 1)} > <FontAwesomeIcon icon={faArrowRight} /> </button>
      </div>
   )
}