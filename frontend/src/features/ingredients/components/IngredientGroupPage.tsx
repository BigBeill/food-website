import { IngredientGroupType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.service";
import { useRouter } from "next/navigation";
import useServiceState from "@/shared/lib/serviceState";
import Loading from "@/shared/components/stateComponents/LoadingPage";
import NotFound from "@/shared/components/stateComponents/NotFoundPage";
import ErrorPage from "@/shared/components/stateComponents/ErrorPage";

export default function IngredientGroupPage() {

   const router = useRouter();

   const groupListState = useServiceState<IngredientGroupType[]>(() => ingredientService.searchGroup(), [])

   if (groupListState.status === 'loading') { return <Loading /> }
   if (groupListState.status === 'error') { return <ErrorPage /> }
   if (groupListState.status !== 'ready') { console.log(groupListState.status); return <NotFound /> }
   return (
      <div className="displayButtons">
         { groupListState.data.map((ingredientGroup, index) => (
            <button
               key={index} 
               onClick={() => router.push(`/ingredient/${ingredientGroup.id}`)}
            >
               {ingredientGroup.name}
            </button>
         ))}
      </div>
   );
}