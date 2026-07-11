// not really an animation but it kind of fits here so ill move it later maybe

import React from "react";
import Styles from './styles/miniComponent.module.scss';

export default function MiniComponent ({ children }: { children: React.ReactNode }) {
   return (
      <div className={Styles.miniComponent}>
         { children }
      </div>
   )
}