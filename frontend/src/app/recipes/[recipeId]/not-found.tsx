import { StateNotFoundPage } from "@/shared/components/stateComponents/NotFound.states";
import { usePathname } from "next/navigation";

export default function NotFoundPage() {
   const recipeId = usePathname().split("/").pop();

   return <StateNotFoundPage><p>recipe _id: {recipeId}<br />Does not exist</p></StateNotFoundPage>
}