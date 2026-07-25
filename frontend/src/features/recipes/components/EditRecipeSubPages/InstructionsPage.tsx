import { ButtonOval } from "@/shared/components/Button.components";
import { InputText } from "@/shared/components/Input.components";
import { useIntractableList } from "@/shared/hooks/useIntractableList";
import { ChildFormContent } from "@/shared/shared.types";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ref, useImperativeHandle, useState } from "react";

export default function EditRecipeInstructionsPage ({ ref }: { ref: Ref<ChildFormContent<string[]>> }) {

   const [newInstruction, setNewInstruction] = useState('');
   const instructionList = useIntractableList({
      renderItemContent: (item: string) => (
         <p>{item}</p>
      ),
      renderItemOptions: (item: string, index: number) => (
         <FontAwesomeIcon 
            role='button'
            tabIndex={0}
            aria-label={`Remove instruction ${index + 1}`}
            icon={faTrash} 
            style={{color: "#575757",}} 
            onClick={() => { instructionList.removeIndex(index) }} 
         />
      ),
      renderItemHeader(item: string, index: number) {
         <h4>Step {index + 1} </h4>
      },
   });

   // function that lets the parent component read and write to instructionList
   useImperativeHandle(ref, () => ({
      getContent: instructionList.content,
      setContent: instructionList.replaceList,
   }), [instructionList])

   function addInstruction() {
      if(newInstruction.length < 3) { return; }
      instructionList.addItem(newInstruction);
      setNewInstruction('');
   }

   return (
      <div className='consumeSpace'>
         <h2>Recipe Instructions</h2>
         { instructionList.reactComponent }

         <InputText
            label="New Instruction"
            value={ newInstruction }
            placeholder="add a new instruction"
            onChange={ (value) => setNewInstruction(value) }
         />
         <ButtonOval onClick={() => { addInstruction(); }}>Add Instruction</ButtonOval>
      </div>
   )
}