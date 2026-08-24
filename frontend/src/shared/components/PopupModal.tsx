"use client"

import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

export function IngredientModal({ children }: { children: React.ReactNode }) {
   const ref = useRef<HTMLDialogElement>(null);
   const router = useRouter();

   useEffect(() => { ref.current?.showModal(); }, []);

   return (
      <dialog ref={ ref } onCancel={ (e) => { e.preventDefault(); router.back(); } }>
         { children }
      </dialog>
   );
}