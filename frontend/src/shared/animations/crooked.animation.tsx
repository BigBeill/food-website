import React from "react";
import Styles from './crooked.module.scss'

export default function CrookedAnimation ({component}: {component: React.ReactNode}) {

   return (
      <div className={Styles.crookedAnimation}>
         {component}
      </div>
   )
}