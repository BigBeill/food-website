import { PackagedImageType } from "@/features/images/domain/image.types";
import styles from './styles/ListItems.module.scss'
import GrowingText from "../GrowingText";
import ImageDisplay from "@/features/images/components/ImageDisplay";


interface ListItemsNotebookPageParams {
   itemList: {
      title: string;
      image: PackagedImageType;
      onClick: () => void;
   }[];
}

export default function ListItemsNotebookPage({ itemList }: ListItemsNotebookPageParams) {

   return (
      <div className={ styles.page }>
         <div className={ styles.list } >
            { itemList.map((item) => (
               <div className={styles.item}>
                  <GrowingText text={ item.title } />
                  <div className={ styles.decretiveLine } aria-hidden="true"/>
                  <ImageDisplay packagedImage={ item.image } />
               </div>
            )) }
         </div>
      </div>
   );
}