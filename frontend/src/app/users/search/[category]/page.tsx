"use client"

import SearchUserPage from "@/features/users/components/SearchUserPage";

export default async function SearchUser({ params }: { params: Promise<{category: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none' }> }) {
   const { category } = await params;
   return <SearchUserPage category={category} />
}