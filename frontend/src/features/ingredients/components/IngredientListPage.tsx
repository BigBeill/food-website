import { IngredientType } from "../domain/ingredient.types";
import { useRouter } from "next/router";
import useServiceState from "@/shared/hooks/useServiceState";
import { ingredientService } from "../services/ingredient.service";
import RequireServiceStateReady from "@/shared/components/RequireServiceStateReady";
import { usePathname } from "next/navigation";

export default function IngredientListPage({ ingredientGroupId }: { ingredientGroupId: number }) {

   const ingredientListState = useServiceState(() => {
      return ingredientService.search({ groupId: ingredientGroupId });
   }, [ingredientGroupId]);

   return (
      <RequireServiceStateReady serviceState={ ingredientListState } >
         { (ingredientList) => <IngredientGroupView ingredientList={ ingredientList } /> }
      </RequireServiceStateReady>
   )
}

function IngredientGroupView({ ingredientList }: { ingredientList: IngredientType[] }) {
   const router = useRouter();
   const pathname = usePathname();

   return (
      <div className="displayButtons">
         { ingredientList.map((ingredient, index) => (
            <button key={index} onClick={ () => router.push(`${pathname}/${ingredient.food_id}`) }>{ ingredient.description }</button>
         )) }
      </div>
   );
}