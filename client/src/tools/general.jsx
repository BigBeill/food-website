export function assignIds(array){
  let list = []
  let count = 0
  array.forEach(item => {
    list.push({
      id: count,
      content: item
    })
    count++
  })
  return list
}

export function removeIds(array){
  let list = []
  array.forEach(item => list.push(item.content))
  return list
}