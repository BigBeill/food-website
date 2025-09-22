import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PopupProps {
   Child: React.ComponentType<any>;
   childProps?: { [key: string]: any; }
   exitPopup: () => void;
}

export default function Popup({Child, childProps, exitPopup}: PopupProps) {
   const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

   useEffect(() => {
      setPortalRoot(document.getElementById("portal-root"));
   }, []);

   if (!portalRoot) { return null;}

   return createPortal(
      <div 
         className="displayPopup fadeIn"
         onClick={() => { exitPopup() } }
      >
         <div
            className="popupContent slideUp"
            onClick={(event: React.MouseEvent) => { event.stopPropagation(); }}
         >
            <Child {...childProps} />
            </div>
      </div>,
      portalRoot
   );
}