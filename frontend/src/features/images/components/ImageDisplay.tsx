import { PackagedImageType } from "../domain/image.types";
import { unpackImage } from "../services/image.services";



export default function ImageDisplay ({ packagedImage }: { packagedImage: PackagedImageType | undefined }) {

   console.log("ImageDisplay rendered:", packagedImage);
   const image = unpackImage(packagedImage);

   return (
      <img {...image} />
   );

}