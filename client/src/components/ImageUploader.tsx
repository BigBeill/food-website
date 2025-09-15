import { useRef, useState, useEffect } from "react"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';



interface ImageUploaderProps {
   imageBuffer?: File | null;
   setImageBuffer: (file: File | null) => void;
   oldImageUrl?: string | null;
   fallbackImageUrl: string;
}

export default function ImageUploader({ imageBuffer, setImageBuffer, oldImageUrl, fallbackImageUrl }: ImageUploaderProps) {
   const maxFileSize = 5 * 1024 * 1024; // 5 MB

   const fileInputRef = useRef<HTMLInputElement | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

   useEffect(() => {
      if (!(imageBuffer instanceof File)) {
         setPreviewUrl(null);
         return;
      }
      const objectUrl = URL.createObjectURL(imageBuffer);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
   }, [imageBuffer]);

   function updateBuffer(file: File) {
      if (file.size <= maxFileSize) { setImageBuffer(file); }
   }

   function uploadFile() {
      fileInputRef.current?.click();
   }

   return (
      <div 
         className="imageInput"
         onClick={uploadFile}
      >
         {/* input will be hidden by css, but still included in DOM for screen readers */}
         <input 
            type="file"
            ref={fileInputRef}
            accept="image/*"
            aria-label="Choose profile photo"
            onChange={(event) => { if (event.target.files?.[0]) { updateBuffer(event.target.files[0]) } }} 
         />

         { previewUrl ? (
            <img className="consumeSpace" alt="preview of uploaded file" src={previewUrl}/>
         ) : ( 
            <img 
               className="consumeSpace" 
               src={oldImageUrl ? oldImageUrl : fallbackImageUrl} 
               alt="default profile" 
               onError={(error: React.SyntheticEvent<HTMLImageElement, Event>) => { (error.currentTarget.src = fallbackImageUrl); }}
            />
         ) }
         <FontAwesomeIcon icon={faCamera}/>
      </div>
   )
}