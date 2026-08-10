import {useState } from "react";
import UserPin from "./UserPin.js";
import PaginationBar from "@/shared/components/PaginationBar.js";
import { UserType, FolderType } from "../domain/user.types.js";
import { usePathname, useSearchParams } from "next/navigation.js";
import { useRouter } from "next/router.js";
import { userService } from "../services/user.service.js";
import useServiceState from "@/shared/hooks/useServiceState.js";
import { PaginatedListType } from "@/shared/shared.types.js";
import RequireServiceStateReady from "@/shared/components/RequireServiceStateReady.js";
import FolderPin from "./FolderPin.js";

type PaginatedCollectionType = Omit<PaginatedListType<unknown>, 'list'> & { folderList: FolderType[], userList: UserType[] }

interface SearchFields {
   userId?: string;
   name?: string;
}

interface SearchUserPageProps {
   folderId?: string
   category?: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none',
}

export default function SearchUserPage({ folderId, category }: SearchUserPageProps) {
   
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   
   const groupSize: number = 15;
   const groupNumber: number = Number(searchParams.get("groupNumber")) || 1;
   const userId = searchParams.get('userId');
   const username = searchParams.get('name');

   const paginatedCollection = useServiceState<PaginatedCollectionType>(async () => {
      let folders: PaginatedListType<FolderType> = { list: [], count: 0 };
      if (!folderId) {
         folders = await userService.searchFolder({ 
            skip: ((groupNumber - 1) * groupSize),
            limit: (groupSize),
         });
      }
      const skipUsers = ((groupNumber - 1) * groupSize) - folders.count;
      const collectUserAmount = Math.max(0, Math.min(groupSize, skipUsers + groupSize));
      let users: PaginatedListType<UserType> = { list: [], count: 0 };
      users = await userService.search({
         ...(userId && { _id: userId }),
         ...(username && { name: username }),
         category: category,
         ...((skipUsers > 0) && { skip: skipUsers }),
         limit: collectUserAmount,
      });
      return { count: (folders.count + users.count), groupNumber, groupSize, folderList: folders.list, userList: users.list }
   }, [folderId, category, groupNumber, userId, username]);

   function handleSubmit(fields: SearchFields) {
      const params= new URLSearchParams();

      if (fields.userId) { params.set("userId", fields.userId); }
      if (fields.name) { params.set("name", fields.name); }

      router.push(`${pathname}?${params.toString()}`);

      // scroll to the top of the page
      document.getElementById("root")?.scrollTo({ top: 0, behavior: "auto" });
   }

   function requestNewGroup(newGroup: number) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('groupNumber', String(newGroup));
      router.push(`${pathname}?${params.toString()}`);
   }

   return (
      <div className="displayPinCollection">
         <FilterUsersPanel handleSubmit={ handleSubmit } />
         <RequireServiceStateReady serviceState={ paginatedCollection } > 
            { (collection) => (<>
               <SearchUserView paginatedCollection={ collection } /> 
               <PaginationBar groupNumber={ groupNumber } groupCount={ Math.ceil((collection.count)/groupSize) } setGroupNumber={ requestNewGroup } />
            </>) }
         </RequireServiceStateReady>
      </div>
   )
}



function FilterUsersPanel({ handleSubmit }: { handleSubmit: (fields: SearchFields) => void }) {
   const [ userId, setUserId ] = useState('');
   const [ name, setName ] = useState('');

   function submitSearch() {
      handleSubmit({ 
         ...(userId && { userId }),
         ...(name && { name }), 
      });
   }

   return (
      <div className="filterPanel">
         <h2>Filter Users - Public</h2>
         <div className="textInput">
            <label htmlFor="searchId">user ID</label>
            <input 
            id="searchId" 
            type="text"
            placeholder="Search by ID (exact match)"
            value={userId || ''}
            onChange={ (event) => setUserId(event.target.value) }
            onKeyDown={ (event) => { if(event.key == "Enter") { submitSearch(); } } }
            />
         </div>
         <div className="textInput">
            <label htmlFor="searchUsername">Username</label>
            <input 
            id="searchUsername" 
            type="text"
            placeholder="Search by username"
            value={ name || '' }
            onChange={ (event) => setName(event.target.value) }
            onKeyDown={ (event) => { if(event.key == "Enter") submitSearch(); } }
            />
         </div>
         <button onClick={ () => submitSearch() }>
            Search
         </button>
      </div>
   );
}



function SearchUserView({ paginatedCollection }: { paginatedCollection: PaginatedCollectionType })  {

   return (
      <>
         { paginatedCollection.folderList.map((folder, index) => (
            <FolderPin key={ index } folder={ folder } />
         ))}

         {/* create a user pin for each user given by the database */}
         { paginatedCollection.userList.map((user, index) => (
            <UserPin key={ index } user={ user } />
         ))}
      </>
   );
}