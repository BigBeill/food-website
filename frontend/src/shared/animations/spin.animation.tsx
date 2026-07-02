import React from "react";
import Styles from './spin.module.scss';

export default function AnimationSpin ({ children }: { children: React.ReactNode }) {
   return (
      <div className={ Styles.spinAnimation }>
         { children }
      </div>
   )
}