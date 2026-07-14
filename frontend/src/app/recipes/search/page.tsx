"use client"

import { useRouter } from "next/router";

export default function SearchRecipe() {
   const router = useRouter()
   router.replace('/recipe/search/public')
}