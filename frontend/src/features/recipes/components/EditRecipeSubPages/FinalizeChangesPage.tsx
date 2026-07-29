import { ButtonShielded } from "@/shared/components/Button.components";
import { InsertError } from "@/shared/components/stateComponents/InsertStateComponents";
import { ServiceMutationReturnType } from "@/shared/hooks/useServiceMutation";

interface EditRecipeFinalizeChangesPageProps {
   saveRecipeMutator: ServiceMutationReturnType<undefined, void>;
   deleteRecipeMutator?: ServiceMutationReturnType<undefined, void>;
}

export default function EditRecipeFinalizeChangesPage({ saveRecipeMutator, deleteRecipeMutator }: EditRecipeFinalizeChangesPageProps) {

   return (
      <div className='consumeSpace'>
         <h2>Finalize Recipe Changes</h2>
         <button className="darkText additionalMargin" onClick={() => { saveRecipeMutator.send(undefined) } }>Save recipe</button>
         { saveRecipeMutator.status === 'error' && <InsertError error={ saveRecipeMutator.error } /> }
         { deleteRecipeMutator?.status === 'error' && <InsertError error={ deleteRecipeMutator.error}/> }
         { deleteRecipeMutator && <ButtonShielded message="Delete Recipe" onClick={ () => { deleteRecipeMutator.send(undefined) } } /> }
         <ButtonShielded message="Revert Changes" onClick={ () => window.location.reload() } />
         <ButtonShielded message="Save Recipe" onClick={ () => saveRecipeMutator.send(undefined) } />
      </div>
   )
}