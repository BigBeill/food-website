import { IngredientGroupType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.service";
import { useRouter } from "next/navigation";
import useServiceState from "@/shared/hooks/useServiceState";
import RequireServiceStateReady from "@/shared/components/RequireServiceStateReady";
import useNotebook from "@/shared/hooks/useNotebook";


export default function IngredientGroupPage() {
   const groupListState = useServiceState<IngredientGroupType[]>(() => ingredientService.searchGroup(), [])

   return (
      <RequireServiceStateReady serviceState={ groupListState } >
         { (groupList) => <IngredientGroupView groupList={ groupList } /> }
      </RequireServiceStateReady>
   );
}

function IngredientGroupView({ groupList }: { groupList: IngredientGroupType[] }) {
   const router = useRouter();
   const notebook = useNotebook();

   return (
      <div className="displayButtons">
         { groupList.map((ingredientGroup, index) => (
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