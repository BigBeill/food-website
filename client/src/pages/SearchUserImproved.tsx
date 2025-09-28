import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useParams } from "react-router-dom";

import axios from "../api/axios.js";
import UserPin from "../components/UserPin.js";
import Folder from "../components/Folder.js";
import PaginationBar from "../components/PaginationBar.tsx";
import UserObject from "../interfaces/UserObject.ts";
import FolderObject from "../interfaces/FolderObject.ts";
import Loading from "../components/Loading.tsx";

// Enhanced interface for search filters
interface SearchFilters {
   _id: string;
   username: string;
   email: string;
}

interface SearchUserState {
   filters: SearchFilters;
   folderList: FolderObject[];
   folderCount: number;
   userList: UserObject[];
   userCount: number;
   loadingPage: boolean;
   error: string | null;
}

export default function SearchUser() {
   // URL parameters and search params
   const [searchParams, setSearchParams] = useSearchParams();
   const { category, folderId } = useParams<{ category: string; folderId?: string }>();

   // Enhanced state management
   const [state, setState] = useState<SearchUserState>({
      filters: {
         _id: searchParams.get("_id") || "",
         username: searchParams.get("username") || "",
         email: searchParams.get("email") || ""
      },
      folderList: [],
      folderCount: 0,
      userList: [],
      userCount: 0,
      loadingPage: true,
      error: null
   });

   // Constants
   const pageSize = 15;
   const currentPage = Number(searchParams.get("pageNumber")) || 1;

   // Memoized category display name
   const categoryDisplayName = useMemo(() => {
      switch (category) {
         case 'friends':
            return 'Friends';
         case 'public':
            return 'Public Users';
         default:
            return 'Users';
      }
   }, [category]);

   // Enhanced filter update function
   const updateFilter = useCallback((field: keyof SearchFilters, value: string) => {
      setState(prev => ({
         ...prev,
         filters: {
            ...prev.filters,
            [field]: value
         }
      }));
   }, []);

   // Clear all filters
   const clearFilters = useCallback(() => {
      setState(prev => ({
         ...prev,
         filters: { _id: "", username: "", email: "" }
      }));
   }, []);

   // Enhanced fetch function with better error handling
   const fetchObjectsFromDatabase = useCallback(async () => {
      setState(prev => ({ ...prev, loadingPage: true, error: null }));

      try {
         // Reset object variables
         setState(prev => ({
            ...prev,
            folderList: [],
            folderCount: 0,
            userList: [],
            userCount: 0
         }));

         // Function to fetch users
         const fetchUsers = async (totalFolders: number, foldersGrabbed: number) => {
            let url = '/user/find?';
            if (state.filters._id) url += `_id=${encodeURIComponent(state.filters._id)}&`;
            if (state.filters.username) url += `username=${encodeURIComponent(state.filters.username)}&`;
            if (state.filters.email) url += `email=${encodeURIComponent(state.filters.email)}&`;
            if (category) url += `category=${category}&`;

            const skip = (currentPage - 1) * pageSize - totalFolders;
            if (skip > 0) url += `skip=${skip}&`;
            url += `limit=${pageSize - foldersGrabbed}&count=true`;

            const response = await axios({ method: 'get', url });

            setState(prev => ({
               ...prev,
               userList: response.userObjectList || [],
               userCount: response.count || 0,
               loadingPage: false
            }));
         };

         // Logic for collecting folders from the database if needed
         if (category === 'friends') {
            let initialFolderList: FolderObject[] = [];
            let initialFolderCount = 0;

            if (!folderId && currentPage === 1) {
               initialFolderList = [{ _id: 'requests', title: 'Friend Requests', content: [] }];
               initialFolderCount = 1;
            }

            const folderResponse = await axios({
               method: 'get',
               url: `/user/folder?limit=${pageSize}&skip=${(currentPage - 1) * pageSize}&count=true`
            });

            setState(prev => ({
               ...prev,
               folderList: [...initialFolderList, ...(folderResponse.folders || [])],
               folderCount: initialFolderCount + (folderResponse.count || 0)
            }));

            await fetchUsers(folderResponse.count || 0, (folderResponse.folders || []).length);
         } else {
            await fetchUsers(0, 0);
         }
      } catch (error) {
         console.error('Error fetching data:', error);
         setState(prev => ({
            ...prev,
            loadingPage: false,
            error: 'Failed to load data. Please try again.'
         }));
      }
   }, [state.filters, category, currentPage, folderId, pageSize]);

   // Enhanced search submission
   const submitSearch = useCallback(() => {
      // Scroll to top
      document.getElementById("root")?.scrollTo({ top: 0, behavior: "smooth" });

      // Update search params
      const newParams = new URLSearchParams();
      if (state.filters._id.trim()) newParams.set("_id", state.filters._id.trim());
      if (state.filters.username.trim()) newParams.set("username", state.filters.username.trim());
      if (state.filters.email.trim()) newParams.set("email", state.filters.email.trim());

      setSearchParams(newParams);
   }, [state.filters, setSearchParams]);

   // Enhanced pagination handler
   const requestNewPage = useCallback((page: number) => {
      setState(prev => ({ ...prev, loadingPage: true, userList: [] }));

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("pageNumber", page.toString());
      setSearchParams(newSearchParams);
   }, [searchParams, setSearchParams]);

   // Handle Enter key in search inputs
   const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
         event.preventDefault();
         submitSearch();
      }
   }, [submitSearch]);

   // Effect for handling URL changes
   useEffect(() => {
      fetchObjectsFromDatabase();
   }, [searchParams, category, folderId]);

   // Show loading state
   if (state.loadingPage) {
      return <Loading />;
   }

   // Show error state
   if (state.error) {
      return (
         <div className="search-user-page">
            <div className="error-container">
               <div className="error-card">
                  <h2>⚠️ Error</h2>
                  <p>{state.error}</p>
                  <button onClick={fetchObjectsFromDatabase} className="retry-button">
                     Try Again
                  </button>
               </div>
            </div>
         </div>
      );
   }

   // Check if filters are active
   const hasActiveFilters = state.filters._id || state.filters.username || state.filters.email;
   const totalResults = state.folderCount + state.userCount;

   return (
      <div className="search-user-page">
         {/* Header Section */}
         <section className="search-header">
            <div className="search-header-content">
               <h1 className="search-title">
                  <span className="search-icon">🔍</span>
                  Search {categoryDisplayName}
               </h1>
               <p className="search-subtitle">
                  {totalResults > 0
                     ? `Found ${totalResults} result${totalResults === 1 ? '' : 's'}`
                     : hasActiveFilters
                        ? 'No results found. Try adjusting your search criteria.'
                        : 'Use the filters below to search for users'
                  }
               </p>
            </div>
         </section>

         {/* Search Filters Section */}
         <section className="search-filters-section">
            <div className="search-filters-container">
               <div className="filter-header">
                  <h3>Search Filters</h3>
                  {hasActiveFilters && (
                     <button onClick={clearFilters} className="clear-filters-btn">
                        ✕ Clear All
                     </button>
                  )}
               </div>

               <div className="filters-grid">
                  <div className="filter-group">
                     <label htmlFor="searchId">User ID</label>
                     <input
                        id="searchId"
                        type="text"
                        placeholder="Search by exact ID"
                        value={state.filters._id}
                        onChange={(e) => updateFilter('_id', e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="filter-input"
                     />
                  </div>

                  <div className="filter-group">
                     <label htmlFor="searchUsername">Username</label>
                     <input
                        id="searchUsername"
                        type="text"
                        placeholder="Search by username"
                        value={state.filters.username}
                        onChange={(e) => updateFilter('username', e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="filter-input"
                     />
                  </div>

                  <div className="filter-group">
                     <label htmlFor="searchEmail">Email</label>
                     <input
                        id="searchEmail"
                        type="email"
                        placeholder="Search by email"
                        value={state.filters.email}
                        onChange={(e) => updateFilter('email', e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="filter-input"
                     />
                  </div>
               </div>

               <div className="filter-actions">
                  <button onClick={submitSearch} className="search-button primary">
                     🔍 Search
                  </button>
               </div>
            </div>
         </section>

         {/* Results Section */}
         <section className="search-results-section">
            <div className="search-results-container">
               {/* Folders */}
               {state.folderList.length > 0 && (
                  <div className="folders-grid">
                     {state.folderList.map((folder, index) => (
                        <div key={folder._id || index} className="folder-wrapper">
                           <Folder folderDetails={folder} />
                        </div>
                     ))}
                  </div>
               )}

               {/* Users */}
               {state.userList.length > 0 && (
                  <div className="users-grid">
                     {state.userList.map((userData, index) => (
                        <div key={userData._id || index} className="user-wrapper">
                           <UserPin userObject={userData} />
                        </div>
                     ))}
                  </div>
               )}

               {/* Empty State */}
               {totalResults === 0 && hasActiveFilters && (
                  <div className="empty-state">
                     <div className="empty-state-content">
                        <div className="empty-icon">🔍</div>
                        <h3>No Results Found</h3>
                        <p>Try adjusting your search criteria or clearing filters to see more results.</p>
                        <button onClick={clearFilters} className="clear-filters-btn secondary">
                           Clear Filters
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </section>

         {/* Pagination */}
         {totalResults > pageSize && (
            <section className="pagination-section">
               <PaginationBar
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalResults / pageSize)}
                  requestNewPage={requestNewPage}
               />
            </section>
         )}
      </div>
   );
}