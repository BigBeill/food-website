import styles from './Buttons.module.scss';

interface ButtonPairedParams {
   firstText: string
   firstAction: () => void
   secondText: string
   secondAction: () => void
}

interface NavigationBarButtonParams {
   isOpen: boolean,
   action: () => void
}

export function ButtonPaired ({ firstText, firstAction, secondText, secondAction }: ButtonPairedParams) {
   return (
      <div className={styles.buttonContent}>
         <button className={styles.buttonPrimary} onClick={firstAction}>{firstText}</button>
         <button className={styles.buttonSecondary} onClick={secondAction}>{secondText}</button>
      </div>
   )
}

export function ButtonNavigationBar ({ isOpen, action }: NavigationBarButtonParams) {
   return (
      <button className={styles.buttonNavigationBar} onClick={action} aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isOpen} aria-controls="navigationBar">
         <div className={`${styles.hamburgerComponent} ${isOpen ? styles.open : ''}`} aria-hidden="true">
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
         </div>
      </button>
   );
}