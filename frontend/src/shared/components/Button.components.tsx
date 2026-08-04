import styles from './styles/buttons.module.scss';
import Spinner from './icons/spinner';
import { useState } from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export interface ButtonIconType {
   icon: IconDefinition;
   label: string; // needed for accessibility
   onClick: () => void;
}

interface ButtonIconListProps {
   iconList: ButtonIconType[];
   loadingState?: boolean;
}

export function ButtonIconList ({ iconList, loadingState = false }: ButtonIconListProps) {
   return (
      <div>
         { iconList.map(({ icon, label, onClick }) => (
            <button key={label} onClick={onClick} aria-label={label}>
               <FontAwesomeIcon icon={icon} />
            </button>
         )) }
      </div>
   );
}



export function ButtonInline ({ children, ...rest }: React.ComponentPropsWithoutRef<'button'>) {
   return (
      <button className={ styles.buttonInline } { ...rest }>{ children }</button>
   );
}



interface ButtonPairedParams {
   firstText: string
   firstOnClick: () => void
   secondText: string
   secondOnClick: () => void
}

export function ButtonPaired ({ firstText, firstOnClick, secondText, secondOnClick }: ButtonPairedParams) {
   return (
      <div className="splitSpace">
         <button className={ styles.buttonPrimary } onClick={ firstOnClick }>{ firstText }</button>
         <button className={ styles.buttonSecondary } onClick={ secondOnClick }>{ secondText }</button>
      </div>
   )
}



interface MobileNavButtonParams {
   navOpen: boolean,
   onClick: () => void
}

export function ButtonMobileNav({ navOpen, onClick }: MobileNavButtonParams ) {

   return (
      <button type="button" className={ styles.buttonMobileNav } onClick={ onClick } >
         <span className="sr-only">Open nav</span>
         <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
         >
            {navOpen ? (
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
               <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
         </svg>
      </button>
   )
}



type ButtonOvalProps = React.ComponentPropsWithoutRef<'button'> & {
   loadingState?: boolean;
};

export function ButtonOval({ children, loadingState, ...rest }: ButtonOvalProps) {
   const { className, ...domProps } = rest;
   return (
      <button className={[styles.buttonOval, loadingState && styles.loadingState, className].filter(Boolean).join(' ') } { ...domProps }>
         { loadingState ? <Spinner /> : children }
      </button>
   );
}



interface ButtonShieldedProps {
   message: string,
   onClick: () => void,
   loadingState?: boolean
}

export function ButtonShielded({ message, onClick, loadingState }: ButtonShieldedProps) {
   const [shielded, setShielded] = useState<boolean>(true);

   function attemptOnClick() {
      if (shielded) { setShielded(false); }
      else { onClick(); }
   }

   return (
      <div className={ [styles.buttonShielded, shielded && styles.shielded].filter(Boolean).join(' ') } >
         <ButtonOval loadingState={ loadingState } onClick={ attemptOnClick }>{ shielded ? message : `confirm ${ message }` }</ButtonOval>
         <ButtonOval onClick={ () => setShielded(true) }>Cancel</ButtonOval>
      </div>
   );
}
