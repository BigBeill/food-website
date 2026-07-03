import styles from './buttons.module.scss';

interface ButtonPairedParams {
   firstText: string
   firstOnClick: () => void
   secondText: string
   secondOnClick: () => void
}

interface NavigationBarButtonParams {
   isOpen: boolean,
   onClick: () => void
}

export function ButtonPaired ({ firstText, firstOnClick, secondText, secondOnClick }: ButtonPairedParams) {
   return (
      <div className="splitSpace">
         <button className={styles.buttonPrimary} onClick={firstOnClick}>{firstText}</button>
         <button className={styles.buttonSecondary} onClick={secondOnClick}>{secondText}</button>
      </div>
   )
}

export function ButtonNavigationBar ({ isOpen, onClick }: NavigationBarButtonParams) {
   return (
      <button className={styles.buttonNavigationBar} onClick={onClick} aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isOpen} aria-controls="navigationBar">
         <div className={`${styles.hamburgerComponent} ${isOpen ? styles.open : ''}`} aria-hidden="true">
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
         </div>
      </button>
   );
}

export function ButtonOval({ className, children, ...rest }: React.ComponentPropsWithoutRef<'button'>) {
   return (
      <button className={[styles.buttonOval, className].filter(Boolean).join(' ')} {...rest}>
         {children}
      </button>
   );
}