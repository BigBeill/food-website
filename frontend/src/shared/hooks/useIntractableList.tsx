import { ReactNode, useRef, useState } from 'react';
import styles from './styles/intractableList.module.scss'
import { Reorder } from 'framer-motion';

interface IntractableListOptions<T> {
   initial?: T[];
   renderItemContent: (item: T, index: number) => ReactNode;
   renderItemOptions: (item: T, index: number) => ReactNode;
   renderItemHeader?: (item: T, index: number) => ReactNode;
}

interface ListItem<T> {
   id: number;
   content: T;
}

export function useIntractableList<T>({ initial = [], renderItemContent, renderItemOptions, renderItemHeader }: IntractableListOptions<T>) {

   const [list, setList] = useState<ListItem<T>[]>(assignIds(initial));
   const nextId = useRef(0); // for simplicity, once an ID has been assigned, it will never be reassigned in this list, even if deleted (unless a list reset happens)

   function assignIds(newList: T[]): ListItem<T>[] {
      return newList.map((item) => {
         return {
            id: nextId.current++,
            content: item,
         }
      });
   }

   function removeIds(): T[] {
      return list.map((item) => {
         return item.content
      });
   }

   function addItem(item: T) { 
      setList((previous) => [...previous, ...assignIds([item])]); 
   }

   function removeIndex(index: number) { 
      setList(list => list.filter((_, i) => i !== index)); 
   }

   function replaceList(newList: T[]) {
      nextId.current = 0;
      setList(assignIds(newList));
   }

   const reactComponent = (
      <Reorder.Group className={ styles.intractableList } axis='y' values={list} onReorder={setList}>
         { list.map((item, index) => (
            <Reorder.Item key={ item.id } value={ item } className={ styles.item }>
               { renderItemHeader && (
                  <div className={ styles.header }>
                     { renderItemHeader(item.content, index) }
                  </div>
               ) }

               <div className={styles.options }>
                  { renderItemOptions(item.content, index) }
               </div>
               <div className={ styles.content }>
                  { renderItemContent(item.content, index) }
               </div>
            </Reorder.Item>
         )) }
      </Reorder.Group>
   );

   return { addItem, content: removeIds, reactComponent, removeIndex, replaceList };
}