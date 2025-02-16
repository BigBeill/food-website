import React from "react";

interface PaginationBarProps {
   currentPage: number;
   totalPages: number;
   requestNewPage: (page: number) => void;
}

export default function PaginationBar({ currentPage, totalPages, requestNewPage }: PaginationBarProps) {
   return (
      <div className="paginationBar">
         { currentPage >= 2 ? 
            <>
               <button onClick={() => requestNewPage(currentPage - 1)}> &lt;&lt; </button>
               <button onClick={() => requestNewPage(1)}> 1 </button>
            </>
            : null
         }
         { currentPage >= 3 ?
            <button onClick={() => requestNewPage(2)}> 2 </button>
            : null
         }
         { currentPage >= 6 ?
            <p>...</p>
            : null
         }
         { currentPage >= 5 ?
            <button onClick={() => requestNewPage(currentPage - 2)}> {currentPage - 2} </button>
            : null
         }
         { currentPage >= 4 ?
            <button onClick={() => requestNewPage(currentPage - 1)}> {currentPage - 1} </button>
            : null
         }
         <p className="primaryBlock">{currentPage}</p>
         { currentPage <= totalPages - 3 ?
            <button onClick={() => requestNewPage(currentPage + 1)}> {currentPage + 1} </button>
            : null
         }
         { currentPage <= totalPages - 4 ?
            <button onClick={() => requestNewPage(currentPage + 2)}> {currentPage + 2} </button>
            : null
         }
         { currentPage <= totalPages - 5 ?
            <p>...</p>
            : null
         }
         { currentPage <= totalPages - 2 ?
            <button onClick={() => requestNewPage(totalPages - 1)}> {totalPages - 1} </button>
            : null
         }
         { currentPage <= totalPages - 1 ?
            <>
               <button onClick={() => requestNewPage(totalPages)}> {totalPages} </button>
               <button onClick={() => requestNewPage(currentPage + 1)}> &gt;&gt; </button>
            </>
            : null
         }
      </div>
   )
}