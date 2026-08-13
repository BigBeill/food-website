import { PackagedImageType } from "@/features/images/domain/image.types";
import styles from './styles/ListItems.module.scss'
import GrowingText from "../GrowingText";
import ImageDisplay from "@/features/images/components/ImageDisplay";



interface NotebookPageListItemsProps {
   itemList: {
      title: string;
      image?: PackagedImageType;
      onClick: () => void;
   }[];
}

export default function NotebookPageListItems({ itemList }: NotebookPageListItemsProps) {
   return (
      <div className={ styles.page }>
         <ul className={ styles.list } >
            { itemList.map((item, index) => (
               <li key={ index } className={ styles.item } onClick={ item.onClick }>
                  <GrowingText text={ item.title } className={ styles.title } />
                  <div className={ styles.decretiveLine } aria-hidden="true"/>
                  <ImageDisplay packagedImage={ item.image } />
               </li>
            )) }
         </ul>
      </div>
   );
}