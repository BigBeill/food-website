"use client"

import SearchUserPage from "@/features/users/components/SearchUserPage";

export default async function SearchRecipe({ params }: {params: Promise<{category: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none', folderId: string}>}) {
   const { folderId } = await params;
   return <SearchUserPage folderId={folderId} />
}