// returns html&css for provided text with maximum posible size before overflowing parentDiv

import React, { useEffect, useRef, useState } from 'react';

function growingText({text, parentDiv}) {
  
  const textRef = useRef(null)
  const [fontSize, setFontSize] = useState(0.1)

  function adjustFontSize() {
    if (parentDiv.current && textRef.current) {
      let newFontSize = .1
      textRef.current.style.fontSize = `${newFontSize}rem`

      while ( textRef.current.scrollWidth <= parentDiv.current.clientWidth && textRef.current.scrollHeight <= parentDiv.current.clientHeight ) {
        newFontSize += .1
        textRef.current.style.fontSize = `${newFontSize}rem`
      }

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
    <h4 ref={textRef}>
      {text}
    </h4>
    )
}

export default growingText