import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import '../styles/componentSpecific/notebook.scss';
import PageObject from '../interfaces/PageObject';
import PaginationBar from './PaginationBar';

// LOOK AT README.MD FILE IN THE ROOT FOLDER FOR INSTRUCTIONS ON HOW TO USE THIS COMPONENT

interface NotebookProps {
   pageList: PageObject[];
   startingPageNumber?: number;
   parentPageNumber?: number;
   setParentPageNumber?: (pageNumber: number) => void;
   requestNewPage?: (pageNumber: number) => void;
   pageCount?: number;
   isLoading?: boolean;
   onPageChange?: (pageNumber: number) => void;
}

interface PageBounds {
   min: number;
   max: number;
   isValid: (pageIndex: number) => boolean;
}

// Custom hook for responsive behavior
function useResponsiveNotebook() {
   const [narrowScreen, setNarrowScreen] = useState<boolean>(false);

   // Debounced resize handler for better performance
   const debouncedResize = useCallback(() => {
      let timeoutId: NodeJS.Timeout;
      return () => {
         clearTimeout(timeoutId);
         timeoutId = setTimeout(() => {
            const width = window.innerWidth;
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const threshold = 78 * rootFontSize; // 78rem
            setNarrowScreen(width < threshold);
         }, 150);
      };
   }, []);

   useEffect(() => {
      const handleResize = debouncedResize();
      handleResize(); // Initial call

      window.addEventListener('resize', handleResize);
      return () => {
         window.removeEventListener('resize', handleResize);
      };
   }, [debouncedResize]);

   return { narrowScreen };
}

// Custom hook for touch/swipe gestures
function useTouchGestures(onSwipeLeft: () => void, onSwipeRight: () => void) {
   const touchStartX = useRef<number>(0);
   const touchEndX = useRef<number>(0);
   const minSwipeDistance = 50;

   const handleTouchStart = useCallback((e: React.TouchEvent) => {
      touchStartX.current = e.targetTouches[0].clientX;
   }, []);

   const handleTouchMove = useCallback((e: React.TouchEvent) => {
      touchEndX.current = e.targetTouches[0].clientX;
   }, []);

   const handleTouchEnd = useCallback(() => {
      if (!touchStartX.current || !touchEndX.current) return;

      const distance = touchStartX.current - touchEndX.current;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
         onSwipeLeft();
      } else if (isRightSwipe) {
         onSwipeRight();
      }
   }, [onSwipeLeft, onSwipeRight, minSwipeDistance]);

   return {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
   };
}

export default function Notebook({
   pageList,
   startingPageNumber = 1,
   parentPageNumber = startingPageNumber,
   setParentPageNumber,
   requestNewPage,
   pageCount = pageList.length,
   isLoading = false,
   onPageChange
}: NotebookProps) {
   const { narrowScreen } = useResponsiveNotebook();
   const [displayRight, setDisplayRight] = useState<boolean>(false);
   const [currentIndex, setCurrentIndex] = useState<number>(parentPageNumber - 1);
   const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

   // Keep currentIndex updated based on parentPageNumber changes
   useEffect(() => {
      setCurrentIndex(parentPageNumber - 1);
   }, [parentPageNumber]);

   // Page bounds calculation with memoization
   const pageBounds = useMemo<PageBounds>(() => {
      const min = startingPageNumber - 1;
      const max = (pageList.length + startingPageNumber) - 2;
      return {
         min,
         max,
         isValid: (pageIndex: number) => pageIndex >= 0 && pageIndex < pageCount
      };
   }, [startingPageNumber, pageList.length, pageCount]);

   // Memoized page content calculation
   const { firstPage, secondPage } = useMemo(() => {
      const firstPageIndex = currentIndex - (startingPageNumber - 1);
      const secondPageIndex = currentIndex - (startingPageNumber - 2);

      return {
         firstPage: pageList[firstPageIndex] || null,
         secondPage: pageList[secondPageIndex] || null
      };
   }, [pageList, currentIndex, startingPageNumber]);

   // Simplified and more robust page change handler
   const handlePageChange = useCallback((newPageIndex: number) => {
      if (isTransitioning) return;

      setIsTransitioning(true);

      try {
         // Validate bounds
         if (!pageBounds.isValid(newPageIndex)) {
            // Handle out of bounds gracefully
            if (newPageIndex < 0) {
               newPageIndex = 0;
            } else if (newPageIndex >= pageCount) {
               newPageIndex = Math.max(0, pageCount - 1);
            }
         }

         // Check if page is outside current pageList bounds
         const isOutsideCurrentList = newPageIndex < (startingPageNumber - 1) ||
                                     newPageIndex > pageBounds.max;

         if (isOutsideCurrentList && requestNewPage) {
            requestNewPage(newPageIndex + 1);
         } else {
            // Update page index
            if (setParentPageNumber) {
               setParentPageNumber(newPageIndex + 1);
            } else {
               setCurrentIndex(newPageIndex);
            }

            // Call optional page change callback
            onPageChange?.(newPageIndex + 1);
         }
      } catch (error) {
         console.error('Error changing page:', error);
      } finally {
         // Reset transition state after animation completes
         setTimeout(() => setIsTransitioning(false), 300);
      }
   }, [isTransitioning, pageBounds, pageCount, startingPageNumber, requestNewPage, setParentPageNumber, onPageChange]);

   // Enhanced navigation functions with better logic
   const previousPage = useCallback(() => {
      const currentGlobalPage = currentIndex + startingPageNumber;

      if (currentGlobalPage > 2) {
         handlePageChange(currentIndex - 2);
      } else if (currentGlobalPage > 1) {
         handlePageChange(currentIndex - 1);
      }
   }, [currentIndex, startingPageNumber, handlePageChange]);

   const nextPage = useCallback(() => {
      if (currentIndex < (pageCount - 1)) {
         handlePageChange(currentIndex + 2);
      }
   }, [currentIndex, pageCount, handlePageChange]);

   // Enhanced page change handler with transition management
   const handleGroupingChange = useCallback((newGrouping: number) => {
      handlePageChange((newGrouping - 1) * 2);
   }, [handlePageChange]);

   // Enhanced keyboard navigation with better accessibility
   const handleKeyDown = useCallback((event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const focusedElement = target?.tagName;
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(focusedElement);

      if (isInputFocused || isTransitioning) return;

      switch (event.key) {
         case 'a':
         case 'A':
         case 'ArrowLeft':
            event.preventDefault();
            previousPage();
            break;
         case 'd':
         case 'D':
         case 'ArrowRight':
            event.preventDefault();
            nextPage();
            break;
         case 'Home':
            event.preventDefault();
            handlePageChange(0);
            break;
         case 'End':
            event.preventDefault();
            handlePageChange(pageCount - 1);
            break;
      }
   }, [previousPage, nextPage, handlePageChange, isTransitioning, pageCount]);

   useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handleKeyDown]);

   // Touch gesture handlers
   const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures(
      nextPage,
      previousPage
   );

   // Enhanced page click handlers with better accessibility
   const handleLeftPageClick = useCallback(() => {
      if (narrowScreen) setDisplayRight(false);
   }, [narrowScreen]);

   const handleRightPageClick = useCallback(() => {
      if (narrowScreen) setDisplayRight(true);
   }, [narrowScreen]);

   return (
      <div
         className="notebookContainer"
         role="application"
         aria-label="Notebook page viewer"
         aria-live="polite"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
      >
         <div className={`notebook ${displayRight ? 'displayRight' : ''} ${isTransitioning ? 'transitioning' : ''}`}>
            <div
               className={`notebookPage ${(displayRight && narrowScreen) ? 'shielded' : ''} ${isLoading ? 'loading' : ''}`}
               onClick={handleLeftPageClick}
               role="region"
               aria-label={`Page ${currentIndex + 1}`}
               tabIndex={narrowScreen ? 0 : -1}
               onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     handleLeftPageClick();
                  }
               }}
            >
               {isLoading ? (
                  <div className="page-loading">
                     <div className="loading-spinner"></div>
                     <p>Loading...</p>
                  </div>
               ) : firstPage ? (
                  <firstPage.content {...firstPage.props} />
               ) : (
                  <div className="empty-page">
                     <p>No content available</p>
                  </div>
               )}
            </div>

            <img
               className="notebookSpine"
               src="/notebookSpine.png"
               alt="Notebook binding"
               role="presentation"
            />

            <div
               className={`notebookPage ${(!displayRight && narrowScreen) ? 'shielded' : ''} ${isLoading ? 'loading' : ''}`}
               onClick={handleRightPageClick}
               role="region"
               aria-label={`Page ${currentIndex + 2}`}
               tabIndex={narrowScreen ? 0 : -1}
               onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     handleRightPageClick();
                  }
               }}
            >
               {isLoading ? (
                  <div className="page-loading">
                     <div className="loading-spinner"></div>
                     <p>Loading...</p>
                  </div>
               ) : secondPage ? (
                  <secondPage.content {...secondPage.props} />
               ) : (
                  <div className="empty-page">
                     <p>No content available</p>
                  </div>
               )}
            </div>
         </div>

         <PaginationBar
            currentPage={Math.ceil((currentIndex + 1) / 2)}
            totalPages={Math.ceil(pageCount / 2)}
            requestNewPage={handleGroupingChange}
         />
      </div>
   );
}

// Error boundary wrapper component
export function NotebookWithErrorBoundary(props: NotebookProps) {
   return (
      <NotebookErrorBoundary>
         <Notebook {...props} />
      </NotebookErrorBoundary>
   );
}

// Simple error boundary for the notebook
class NotebookErrorBoundary extends React.Component<
   { children: React.ReactNode },
   { hasError: boolean; error?: Error }
> {
   constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
   }

   static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
   }

   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Notebook Error:', error, errorInfo);
   }

   render() {
      if (this.state.hasError) {
         return (
            <div className="notebook-error" role="alert">
               <h2>Something went wrong with the notebook</h2>
               <p>Please try refreshing the page.</p>
               <button
                  onClick={() => this.setState({ hasError: false })}
                  className="retry-button"
               >
                  Try Again
               </button>
            </div>
         );
      }

      return this.props.children;
   }
}