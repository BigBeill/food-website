import { useEffect, useState } from "react";
import { IngredientGroupType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.api";
import { useRouter } from "next/router";

export default function IngredientGroupPage() {

   const router = useRouter();
   const [groupList, setGroupList] = useState<IngredientGroupType[]>([]);

   useEffect(() => {
      ingredientService.groupList()
      .then((response) => { setGroupList(response) })
      .catch((error) => console.error(error));
   },[]);

   return (
      <div className="displayButtons">
         {groupList.map((ingredientGroup, index) => (
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