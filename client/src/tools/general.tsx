export function assignIds(array: any[]) {
  let list: {id: number, content: any}[] = [];
  let count: number = 0;
  array.forEach(item => {
    list.push({
      id: count,
      content: item
    });
    count++;
  })
  return list;
}

export function removeIds(array: {id: number, content: any}[]) {
  let list: any[] = [];
  array.forEach(item => list.push(item.content));
  return list;
}