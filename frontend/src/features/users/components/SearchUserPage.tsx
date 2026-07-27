import {useState, useEffect } from "react";

import UserPin from "./UserPin.js";
import Folder from "./Folder.js";
import PaginationBar from "@/shared/components/PaginationBar.js";
import { UserType, FolderType } from "../domain/user.types.js";
import { usePathname, useSearchParams } from "next/navigation.js";
import { userService } from "../services/user.api.js";
import { useRouter } from "next/router.js";

interface SearchUserPageProps {
   folderId?: string
   category?: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none',
}

export default function SearchUserPage({folderId, category}: SearchUserPageProps)  {

   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const initialUserId = searchParams.get('userId');
   const initialName = searchParams.get('name');

   const [userId, setUserId] = useState<string>(initialUserId || '');
   const [name, setName] = useState<string>(initialName || '');

   // save the page size and current page number
   const groupSize: number = 15;
   const groupNumber: number = Number(searchParams.get("groupNumber")) || 1;

   // state variables for variables collected from the server
   const [folderList, setFolderList] = useState<FolderType[]>([]);
   const [userList, setUserList] = useState<UserType[]>([]);
   const [itemCount, setItemCount] = useState<number>(0);

   async function searchUsers() {
      // reset object variables
      setFolderList([]);
      setUserList([]);
      setItemCount(0);

      // logic for collecting folders from the database if needed
      let folderList: FolderType[] = [];
      let folderCount = 0;
      if (category == 'friends') {
         let folderCount = !folderId ? 1 : 0; // if your in the root of your friends search, make room for the "Friend Request" folder

         if (!folderId) {
            let folderLimit = groupSize;

            // if your in the root of your friends search, make room for the "Friend Request" folder
            folderCount = 1;
            if (groupNumber == 1) { 
               // add the friend request folder if applicable
               folderList = [{ _id: 'requests', title: 'Friend Requests', content: [] }];
               folderLimit--;
            }

            const returnedFolderList: {count: number, list: FolderType[]} = await userService.folderList({
               limit: folderLimit,
               skip: ((groupNumber - 1) * groupSize),
               includeCount: true,
            }) as {count: number, list: FolderType[]};

            folderList = [...folderList, ...returnedFolderList.list];
            folderCount = folderCount + returnedFolderList.count;
         }
      }

      let availableSpaces = groupSize - (folderCount - ((groupNumber - 1) * groupSize));
      if (availableSpaces > groupSize) { availableSpaces = groupSize; }
      let skipUsers = (groupSize * (groupNumber - 1)) - folderCount;
      if (skipUsers < 0) { skipUsers = 0; }

      const returnedUserList: {count:number, list:UserType[]} = await userService.search({
         _id: userId,
         name,
         category,
         limit: availableSpaces,
         skip: skipUsers,
         includeCount: true,
      }) as {count:number, list:UserType[]};

      setUserList(returnedUserList.list);
      setItemCount(returnedUserList.count + folderCount);

   }

   useEffect(() => {
      searchUsers();
   },[folderId, category, initialUserId, initialName, groupNumber]);

   // handler for when the search button is clicked
   function handleSubmit() {
      const params= new URLSearchParams();

      if (userId) { params.set("userId", userId); }
      if (name) { params.set("name", name); }

      router.push(`${pathname}?${params.toString()}`);

      // scroll to the top of the page
      document.getElementById("root")?.scrollTo({ top: 0, behavior: "auto" });
   }

   // handler for when new page is requested by the pagination bar
   function requestNewGroup(newGroupNumber: number) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('groupNumber', String(newGroupNumber));
      router.push(`${pathname}?${params.toString()}`);
   }

   return (
      <div>
         <div className="displayPinCollection">

            <div className="filterPanel">
               <h2>Filter Users - Public</h2>
               <div className="textInput">
                  <label htmlFor="searchId">user ID</label>
                  <input 
                  id="searchId" 
                  type="text"
                  placeholder="Search by ID (exact match)"
                  value={userId || ''}
                  onChange={(event) => setUserId(event.target.value)}
                  onKeyDown={ (event) => { if(event.key == "Enter") handleSubmit(); } }
                  />
               </div>
               <div className="textInput">
                  <label htmlFor="searchUsername">Username</label>
                  <input 
                  id="searchUsername" 
                  type="text"
                  placeholder="Search by username"
                  value={name || ''}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={ (event) => { if(event.key == "Enter") handleSubmit(); } }
                  />
               </div>
               <button onClick={() => handleSubmit()}>
                  Search
               </button>
            </div>

            { folderList.map((folder, index) => (
               <Folder key={index} folder={folder} />
            ))}

            {/* create a user pin for each user given by the database */}
            { userList.map((userData, index) => (
               <UserPin key={index} initialUser={userData} />
            ))}
         </div>

         <PaginationBar currentGroup={groupNumber} totalGroups={Math.ceil((itemCount)/groupSize)} requestNewGroup={requestNewGroup} />
      </div>
   );
}