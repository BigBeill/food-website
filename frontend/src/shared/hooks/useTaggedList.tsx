import { useRef, useState } from "react";

export default function useTaggedList<T>() {

   const [content, setContent] = useState<{id: number, item: T}[]>([]);

   const nextId = useRef(0); // for simplicity, once an ID has been assigned, it will never be reassigned in this list, even if deleted

   function addIds(untaggedList: T[]): {id: number, item: T}[] {
      return untaggedList.map((item) => {return {id: nextId.current++, item}})
   }
   function removeIds(): T[] {
      return content.map((item) => { return item.item });
   }
   function appendItem(item: T) {
      const id = nextId.current++;
      setContent((taggedList) => [...taggedList, {id, item}]);
   }
   function appendList(itemList: T[]) {
      setContent((content) => [...content, ...addIds(itemList)]);
   }
   function replaceList(itemsList: T[]) {
      nextId.current = 0;
      setContent((content) => addIds(itemsList));
   }
   function deleteItem(index: number) {
      setContent((content) => { return content.filter((_, i) => i !== index); });
   }

   return {
      content,
      untaggedContent: removeIds(),
      appendItem,
      appendList,
      replaceList,
      deleteItem,
   }
}