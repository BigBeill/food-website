// not really an animation but it kind of fits here so ill move it later maybe

import React from "react";
import Styles from './miniComponent.module.scss';

export default function MiniComponent ({ component }: { component: React.ReactNode }) {
   return (
      <div className={Styles.miniComponent}>
         {component}
      </div>
   )
}