import React, { useRef } from "react";

import GrowingText from "./GrowingText";

export default function UserNoteBookPin({ userData }) {

   const parentRefs = useRef(null);

   return (
      <div className="noteBookPin" >
         <div className="title" ref={parentRefs}>
            <GrowingText text={userData.username} parentDiv={parentRefs} />
         </div>
      </div>
   )
}