import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface PopupProps {
   Child: React.ComponentType<any>;
   childProps?: { [key: string]: any; }
   closePopup: () => void;
}

export default function Popup({Child, childProps, closePopup}: PopupProps) {
   const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

   useEffect(() => {
      setPortalRoot(document.getElementById("portal-root"));
   }, []);

   if (!portalRoot) { return null;}

   return createPortal(
      <div 
         className="displayPopup fadeIn"
         onClick={() => { closePopup() } }
      >
         <div
            className="popupContent slideUp"
            onClick={(event: React.MouseEvent) => { event.stopPropagation(); }}
         >
            <Child {...childProps} />

            <button
               className="closePopupButton"
               aria-label="Close popup button"
               onClick={() => { closePopup() }}
            >
               <FontAwesomeIcon icon={faXmark} />
            </button>
         </div>
      </div>,
      portalRoot
   );
}