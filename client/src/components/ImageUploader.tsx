import { ChangeEvent } from "react"

interface ImageUploaderProps {
   file?: File;
   setFile: (file: File) => void;
}

export default function ImageUploader({ file, setFile }: ImageUploaderProps) {
   const maxFileSize = 5 * 1024 * 1024; // 5 MB

   function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
      const newFile = event.target.files?.[0];
      if (newFile && newFile.size <= maxFileSize) { setFile(newFile); }
   }

   return (
      <div className="image-uploader">
         <input type="file" onChange={handleFileChange} />
         {file && (
            <div>
               <p>File name: {file.name}</p>
               <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
               <p>Type: {file.type}</p>
            </div>
         )}
      </div>
   )
}