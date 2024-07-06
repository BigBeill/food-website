import React, { useRef } from 'react';

/*
list = [{
  title: string
  content: string
}]
*/

export default function ClickAndDragList({list}) {

  if (typeof list[0] == 'string') {
    return (
      <ul className="clickAndDragList">
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )
  }

  else if (typeof list[0] == 'object'){
    return (
      <div className="clickAndDragList">
        {list.map((item, index) => (
          <div key={index} className="clickAndDragObject">
            <h4>{item.title}</h4>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    )
  }

  else {
    return (
      <div className="clickAndDragList">
      </div>
    )
  }
}