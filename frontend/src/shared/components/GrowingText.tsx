import { useEffect, useRef } from 'react';
import styles from './styles/growingText.module.scss'

type GrowingTextProps = React.ComponentPropsWithoutRef<'div'> & {
   text: string;
}

function GrowingText({ text, ...divProps }: GrowingTextProps) {

   const wrapperRef = useRef<HTMLDivElement>(null);
   const textRef = useRef<HTMLHeadingElement>(null);

   function adjustFontSize() {
      if (textRef.current && wrapperRef.current) {
         let fontSize = 1.2;
         textRef.current.style.fontSize = `${fontSize}rem`;
         while (textRef.current.scrollHeight < wrapperRef.current.scrollHeight) {
            fontSize += 0.1;
            if (fontSize > 64) { 
               console.warn("Growing Text component hit its maximum font size of 64rem, text may be overflowing parent div");
               break; 
            } // maximum font size, should never realistically hit this
            textRef.current.style.fontSize = `${fontSize}rem`;
         }
         while( textRef.current.scrollHeight > textRef.current.offsetHeight || textRef.current.scrollWidth > textRef.current.offsetWidth) {
            fontSize -= 0.1;
            if (fontSize < 1.2) { break; } // minimum font size
            textRef.current.style.fontSize = `${fontSize}rem`;
         }
      }
   }

   useEffect(() => {
      adjustFontSize();
      window.addEventListener('resize', adjustFontSize);
      return () => window.removeEventListener('resize', adjustFontSize);
   }, [text, wrapperRef]);

   return (
      <div { ...divProps } className={ styles.textWrapper } ref={ wrapperRef }>
         <h2 className={ styles.text } ref={ textRef }>
            { text }
         </h2>
      </div>
   );
}

export default GrowingText;