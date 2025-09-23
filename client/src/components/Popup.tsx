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

      const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { closePopup(); }  };
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
      return () => {
         window.removeEventListener('keydown', onKey);
         document.body.style.overflow = prev;
      };
   }, []);

   if (!portalRoot) { return null;}

   return createPortal(
      <div 
         className="displayPopup fadeIn"
         role="dialog"
         aria-modal="true"
         onClick={() => { closePopup() } }
      >
         <div
            className="popupContent slideUp"
            onClick={(event: React.MouseEvent) => { event.stopPropagation(); }}
            aria-label="Popup content"
         >
            <Child {...childProps} />

            <button
               className="closePopupButton"
               aria-label="Close"
               title="Close"
               onClick={() => { closePopup() }}
            >
               <FontAwesomeIcon icon={faXmark} />
            </button>
         </div>
      </div>,
      portalRoot
   );
}