import styles from './styles/buttons.module.scss';
import Spinner from './icons/spinner';

interface ButtonPairedParams {
   firstText: string
   firstOnClick: () => void
   secondText: string
   secondOnClick: () => void
}

interface MobileNavButtonParams {
   navOpen: boolean,
   onClick: () => void
}

type ButtonOvalProps = React.ComponentPropsWithoutRef<'button'> & {
   loadingState?: boolean;
};

export function ButtonPaired ({ firstText, firstOnClick, secondText, secondOnClick }: ButtonPairedParams) {
   return (
      <div className="splitSpace">
         <button className={styles.buttonPrimary} onClick={firstOnClick}>{firstText}</button>
         <button className={styles.buttonSecondary} onClick={secondOnClick}>{secondText}</button>
      </div>
   )
}

export function ButtonOval({ className, children, loadingState, ...rest }: ButtonOvalProps) {
   return (
      <button className={[styles.buttonOval, loadingState && styles.loadingState, className].filter(Boolean).join(' ')} {...rest}>
         { loadingState ? <Spinner /> : children }
      </button>
   );
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