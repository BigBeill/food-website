// returns html&css for provided text with maximum possible size before overflowing parentDiv

import React, { useEffect, useRef, useState } from 'react';

function GrowingText({text, parentDiv}) {
  
  const textRef = useRef(null)

  const [fontSize, setFontSize] = useState(0.1)

  function adjustFontSize() {
    if (parentDiv.current && textRef.current) {

      let newFontSize = .1 // set font size to be tiny
      textRef.current.style.fontSize = `${newFontSize}rem` // apply new font size to textRef

      // while textRef is smaller than parentDiv
      while ( textRef.current.scrollWidth <= parentDiv.current.clientWidth && textRef.current.scrollHeight <= parentDiv.current.clientHeight ) {
        newFontSize += .1 // increase the font size by a small amount
        textRef.current.style.fontSize = `${newFontSize}rem` // apply new font size
      }

      // once textRef is larger than parentDiv, decrease the size by a small amount and apply changes
      setFontSize(newFontSize - .2)
    }
  }
  
  useEffect(() => {
    adjustFontSize()
    window.addEventListener('resize', adjustFontSize)
    return () => window.removeEventListener('resize', adjustFontSize)
  }, [])

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.fontSize = `${fontSize}rem`;
    }
  }, [fontSize]);

  return (
    <h4 className="growingText" ref={textRef}>
      {text}
    </h4>
    )
}

export default GrowingText