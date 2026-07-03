import { useEffect, useState } from "react";
import { IngredientType } from "../domain/ingredient.types";
import { ingredientService } from "../services/ingredient.api";
import { useRouter } from "next/router";

interface IngredientListPageProps {
   ingredientGroupId: string;
}
export default function IngredientListPage({ingredientGroupId}: IngredientListPageProps) {

   const router = useRouter();
   const [ingredientList, setIngredientList] = useState<IngredientType[]>([]);
   
   useEffect(() => {
      ingredientService.search({
         groupId: ingredientGroupId,
      })
      .then((response) => { setIngredientList(response); })
      .catch((error) => { console.error(error); });
   },[]);

   return (
      <div className="displayButtons">
         {ingredientList.map((ingredient, index) => (
            <button key={index} onClick={() => router.push(`ingredient/${ingredientGroupId}/${ingredient.id}`)}>{ingredient.description}</button>
         ))}
      </div>
   )
}