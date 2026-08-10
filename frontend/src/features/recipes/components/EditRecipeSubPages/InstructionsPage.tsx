import { ButtonOval } from "@/shared/components/Button.components";
import { InputText } from "@/shared/components/Input.components";
import { useInteractableList } from "@/shared/hooks/useInteractableList";
import { DataHandle } from "@/shared/shared.types";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ref, useImperativeHandle, useRef, useState } from "react";

interface EditRecipeInstructionsPage {
   ref: Ref<DataHandle<string[]>>;
   initial?: string[];
}

export default function EditRecipeInstructionsPage ({ ref, initial }: EditRecipeInstructionsPage) {

   const newInstructionRef = useRef<DataHandle<string>>(null);

   const instructionList = useInteractableList({
      initial,
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
      getData: () => instructionList.content,
      setData: instructionList.replaceList,
   }), [instructionList])

   function addInstruction() {
      const newInstruction = newInstructionRef.current!.getData();
      if(newInstruction.length < 3) { return; }
      instructionList.addItem(newInstruction);
      newInstructionRef.current!.setData('');
   }

   return (
      <div className='consumeSpace'>
         <h2>Recipe Instructions</h2>
         { instructionList.htmlView }

         <InputText
            label="New Instruction"
            placeholder="add a new instruction"
            dataRef={ newInstructionRef }
         />
         <ButtonOval onClick={() => { addInstruction(); }}>Add Instruction</ButtonOval>
      </div>
   )
}