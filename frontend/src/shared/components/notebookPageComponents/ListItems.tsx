import { PackagedImageType } from "@/features/images/domain/image.types";
import styles from './styles/ListItems.module.scss'
import GrowingText from "../GrowingText";
import ImageDisplay from "@/features/images/components/ImageDisplay";
import { LinkBackground } from "../Link.components";



interface NotebookPageListItemsProps {
   itemList: {
      title: string;
      image?: PackagedImageType;
      href: string;
   }[];
}

export default function NotebookPageListItems({ itemList }: NotebookPageListItemsProps) {
   return (
      <div className={ styles.page }>
         <ul className={ styles.list } >
            { itemList.map((item, index) => (
               <li key={ index } className={ styles.item }>
                  <LinkBackground href={ item.href }>
                     <GrowingText text={ item.title } className={ styles.title } />
                     <div className={ styles.decretiveLine } aria-hidden="true"/>
                     <ImageDisplay packagedImage={ item.image } />
                  </LinkBackground>
               </li>
            )) }
         </ul>
      </div>
   );
}