import { ButtonShielded } from "@/shared/components/Button.components";
import { InsertError } from "@/shared/components/stateComponents/InsertStateComponents";
import { ServiceMutationType } from "@/shared/lib/serviceMutation";

interface EditRecipeFinalizeChangesPageProps {
   saveRecipeMutator: ServiceMutationType<undefined, void>;
   deleteRecipeMutator?: ServiceMutationType<undefined, void>;
}

export default function EditRecipeFinalizeChangesPage({ saveRecipeMutator, deleteRecipeMutator }: EditRecipeFinalizeChangesPageProps) {

   return (
      <div className='consumeSpace'>
         <h2>Finalize Recipe Changes</h2>
         <button className="darkText additionalMargin" onClick={() => { saveRecipeMutator.send(undefined) } }>Save recipe</button>
         { saveRecipeMutator.state.status === 'error' && <InsertError error={ saveRecipeMutator.state.error } /> }
         { deleteRecipeMutator?.state.status === 'error' && <InsertError error={ deleteRecipeMutator.state.error}/> }
         { deleteRecipeMutator && <ButtonShielded message="Delete Recipe" onClick={ () => { deleteRecipeMutator.send(undefined) } } /> }
         <ButtonShielded message="Revert Changes" onClick={ () => window.location.reload() } />
         <ButtonShielded message="Save Recipe" onClick={ () => saveRecipeMutator.send(undefined) } />
      </div>
   )
}