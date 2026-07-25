import ImageUploader from "@/features/images/components/ImageUploader";
import { PackagedImageType } from "@/features/images/domain/image.types";
import { ChildFormContent } from "@/shared/shared.types";
import { Ref, useImperativeHandle, useState } from "react";

interface EditRecipeAdditionalInfoPageProps {
   oldImage?: PackagedImageType;
   ref: Ref<ChildFormContent<{ imageBuffer?: File, visibility: 'public' | 'private' | 'personal' }>>;
}

export default function EditRecipeAdditionalInfoPage ({ oldImage, ref }: EditRecipeAdditionalInfoPageProps) {

   const [imageBuffer, setImageBuffer] = useState<File | null>(null);
   const [visibility, setVisibility] = useState<'public' | 'private' | 'personal'>('public');

   useImperativeHandle(ref, () => ({
      getContent: () => { return { ...(imageBuffer && { imageBuffer }), visibility } },
      setContent: ({ imageBuffer, visibility }) => { 
         if (imageBuffer) { setImageBuffer(imageBuffer); }
         setVisibility(visibility);
      }
   }),[imageBuffer, visibility]);

   return (
      <div className='consumeSpace'>
         <h2>Additional Information</h2>

         <div style={{ width: '12rem', height: '12rem', margin: '0rem 0rem 3rem 3rem' }}>
            <ImageUploader 
               imageBuffer={imageBuffer} 
               setImageBuffer={setImageBuffer}
               oldImage={oldImage}
               category='recipe'
            />
         </div>

         <div className='textInput center additionalMargin'>
            <div className='radioButtonInput'>
               <label>Recipe Visibility</label>
               <div className='radioOption'>
                  <input type='radio' id='public' name='visibility' value='public' checked={visibility == 'public'} onChange={() => { setVisibility('public'); }}/>
                  <label htmlFor='public'>Public - Anyone can view this recipe</label>
               </div>
               <div className='radioOption'>
                  <input type='radio' id='private' name='visibility' value='private' checked={visibility == 'private'} onChange={() => { setVisibility('private'); }}/>
                  <label htmlFor='private'>Private - You and friends can view this recipe</label>
               </div>
               <div className='radioOption'>
                  <input type='radio' id='personal' name='visibility' value='personal' checked={visibility == 'personal'} onChange={() => { setVisibility('personal') }}/>
                  <label htmlFor='personal'>Personal - Only you can view this recipe</label>
               </div>
            </div>
         </div>
      </div>
   )
}