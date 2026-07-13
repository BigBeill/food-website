import { PackagedImageType } from "../domain/image.types";
import { unpackImage } from "../services/image.services";



export default function ImageDisplay ({ packagedImage }: { packagedImage: PackagedImageType | undefined }) {

   const image = unpackImage(packagedImage);

   return (
      <img {...image} />
   );

}