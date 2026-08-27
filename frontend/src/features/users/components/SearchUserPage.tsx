"use client"

import {useState } from "react";
import { useSearchParams } from "next/navigation";
import useServiceState from "@/shared/hooks/useServiceState";
import { BrokenPaginatedListType } from "@/shared/shared.types";
import UserFilterPage from "./UserFilterPage";
import { userService } from "../services/user.service";
import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import combinePaginatedLists from "@/shared/lib/combinePaginatedLists";
import Notebook from "@/shared/components/Notebook";

const groupSize = 5;


export default function SearchUserPage() {

   const searchParams = useSearchParams();

   const userId = searchParams.get('userId');
   const name = searchParams.get('name');
   const groupNumber: number = Number(searchParams.get("groupNumber")) || 1;

   const [notebookComponents, setNotebookComponents] = useState<BrokenPaginatedListType<React.ReactElement>>({ list: [<UserFilterPage/>], count: 1, firstItemIndex: 0 });

   useServiceState(async() => {
      const response = await userService.search({ 
         ...(userId && { _id: userId }),
         ...(name && { name }),
         skip: Math.max(((groupNumber - 1) * groupSize * 2) - groupSize, 0),
         limit: (groupNumber == 1 ? groupSize : groupSize * 2)
      });

      let newComponents = []
      
         for (let i = 0; i < response.list.length; i += groupSize) {
            const userList = response.list.slice(i, i + groupSize);
            const itemList = userList.map((user) => { return { title: user.name, image: user.image, href: `/recipes/${ user._id }` } });
            newComponents.push(<NotebookPageListItems itemList={ itemList } defaultListSize={ groupSize } />);
         }
   
         setNotebookComponents((previous) => { return combinePaginatedLists(previous, { list: newComponents,  count: Math.ceil(response.count / groupSize), firstItemIndex: ((groupNumber - 1) * 2) + 1 }) });
   
   }, [searchParams]);

   return <Notebook components={ notebookComponents } />
}