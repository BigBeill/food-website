// external imports
import React, { useEffect, useRef } from 'react';

/*
returns html&css for provided text with maximum possible size before overflowing parentDiv

how to use:

  import React, { useRef } from 'react';

  function MyComponent() {
    const parentDiv = useRef(null);

    return (
      <div ref={parentDiv}>
        <GrowingText text="Hello, World!" parentDiv={parentDiv} />
      </div>
    )
  }

*/

function GrowingText({ text, parentDiv }) {
  
  const textRef = useRef<HTMLDivElement>(null);

  function adjustFontSize() {
    if (textRef.current && parentDiv.current) {
      textRef.current.style.fontSize = `1rem`;
      const newWidth = parentDiv.current.clientWidth / textRef.current.scrollWidth;
      const newHeight = parentDiv.current.clientHeight / textRef.current.scrollHeight;
      if (newWidth < newHeight) {
        textRef.current.style.fontSize = `${newWidth}rem`;
      } else {
        textRef.current.style.fontSize = `${newHeight}rem`;
      }
    }
  }

  useEffect(() => {
    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [text, parentDiv]);

  return (
    <h4 className="growingText" ref={textRef}>
      {text}
    </h4>
  );
}

export default GrowingText;