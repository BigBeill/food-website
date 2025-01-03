import React, { useRef } from "react";

import GrowingText from "./GrowingText";

export default function UserNotebookPin({ userData }) {

   const parentRefs = useRef(null);

   return (
      <div className="pin" >
         <div className="title" ref={parentRefs}>
            <GrowingText text={userData.username} parentDiv={parentRefs} />
         </div>
      </div>
   )
}
