
import "../styles/componentSpecific/paginationBar.scss";

interface PaginationBarProps {
   currentPage: number;
   totalPages: number;
   requestNewPage: (page: number) => void;
}

export default function PaginationBar({ currentPage, totalPages, requestNewPage }: PaginationBarProps) {

   return (
      <div className="paginationBar">
         <div className={(currentPage > 5)? 'hidden' : 'invisible'}>F</div> {/* balancing div, will never be shown, just takes up space and balances the flexbox*/}
         { currentPage == 4 ? (
            <>
               <div className="invisible">F</div> {/* balancing div, will never be shown, just takes up space and balances the flexbox*/}
               <button onClick={() => requestNewPage(0)}> 1 </button>
            </>
         ): currentPage > 4 ? (
            <>
               <button onClick={() => requestNewPage(0)}> 1 </button>
               <button onClick={() => requestNewPage(1)}> 2 </button>
            </>
         ): (
            <>
               <div className="invisible">F</div> {/* balancing div, will never be shown, just takes up space and balances the flexbox*/}
               <div className="invisible">F</div> {/* balancing div, will never be shown, just takes up space and balances the flexbox*/}
            </>
         )}
         <p className={(currentPage > 5)? '' : 'hidden'} >...</p>
         <button className={(currentPage > 2)? '' : 'invisible'} onClick={() => requestNewPage(currentPage - 2)}> {currentPage - 2} </button>
         <button className={(currentPage > 1)? '' : 'invisible'} onClick={() => requestNewPage(currentPage - 1)}> {currentPage - 1} </button>
         <p className="primaryBlock">{currentPage}</p>
         <button className={(currentPage < totalPages)? '' : 'invisible'} onClick={() => requestNewPage(currentPage + 1)}> {currentPage + 1} </button>
         <button className={(currentPage < totalPages - 1)? '' : 'invisible'}  onClick={() => requestNewPage(currentPage + 2)}> {currentPage + 2} </button>
         <p className={(currentPage < totalPages - 4)? '' : 'hidden'} >...</p>
         {currentPage == (totalPages - 3)? (
            <>
               <button onClick={() => requestNewPage(totalPages)}> {totalPages} </button>
               <div className="invisible">F</div> {/* balancing div, will never be shown, just takes up space and balances the flexbox*/}
            </>
         ) : currentPage < (totalPages - 3)? (
            <>
              <button  onClick={() => requestNewPage(totalPages - 1)}> {totalPages - 1} </button>
              <button onClick={() => requestNewPage(totalPages)}> {totalPages} </button> 
            </>
         ) : (
            <>
               <div className="invisible">F</div> {/* balancing div, will never be shown, just takes up space and balances the flexbox*/}
               <div className="invisible">F</div> {/* balancing div, will never be shown, just takes up space and balances the flexbox*/}
            </>
         )}
         <div className={(currentPage <= totalPages - 4)? 'hidden' : 'invisible'}>F</div> {/* balancing div, will never be shown, just takes up space and balances the flexbox*/}
      </div>
   )
}