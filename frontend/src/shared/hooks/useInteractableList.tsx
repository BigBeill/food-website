import { ReactNode, useRef, useState } from 'react';
import styles from './styles/interactableList.module.scss'
import { Reorder } from 'framer-motion';

interface InteractableListActions<T> {
   addItem: (item: T) => void;
   removeIndex: (index: number) => void;
   replaceList: (newList: T[]) => void;
}

interface InteractableListOptions<T> {
   initial?: T[];
   renderItemContent: (item: T, index: number, actions: InteractableListActions<T>) => ReactNode;
   renderItemOptions: (item: T, index: number, actions: InteractableListActions<T>) => ReactNode;
   renderItemHeader?: (item: T, index: number, actions: InteractableListActions<T>) => ReactNode;
}

interface ListItem<T> {
   id: number;
   content: T;
}

export function useInteractableList<T>({ initial = [], renderItemContent, renderItemOptions, renderItemHeader }: InteractableListOptions<T>) {

   const nextId = useRef(0); // for simplicity, once an ID has been assigned, it will never be reassigned in this list, even if deleted (unless a list reset happens)
   const [list, setList] = useState<ListItem<T>[]>(() => assignIds(initial));

   function assignIds(newList: T[]): ListItem<T>[] {
      return newList.map((item) => ({
         id: nextId.current++,
         content: item,
      }));
   }

   function removeIds(): T[] {
      return list.map((item) => item.content);
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

   const actions: InteractableListActions<T> = { addItem, removeIndex, replaceList };

   const htmlView = (
      <Reorder.Group className={ styles.interactableList } axis='y' values={list} onReorder={setList}>
         { list.map((item, index) => (
            <Reorder.Item key={ item.id } value={ item } className={ styles.item }>
               { renderItemHeader && (
                  <div className={ styles.header }>
                     { renderItemHeader(item.content, index, actions) }
                  </div>
               ) }

               <div className={styles.options }>
                  { renderItemOptions(item.content, index, actions) }
               </div>
               <div className={ styles.content }>
                  { renderItemContent(item.content, index, actions) }
               </div>
            </Reorder.Item>
         )) }
      </Reorder.Group>
   );

   return { ...actions, content: removeIds(), htmlView };
}