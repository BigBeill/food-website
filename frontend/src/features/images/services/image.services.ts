import { PackagedImageType, UnpackedImageType } from "@/features/images/domain/image.types";

const BASE_URL = process.env.PUBLIC_API_URL;
const RECIPE_FALLBACK_IMAGE = "/recipe-fallback-image.png";
const USER_FALLBACK_IMAGE = "/recipe-fallback-image.png";

interface unpackImage {
   category: "recipe" | "user";
   image?: PackagedImageType
}
export function unpackImage ({category, image}: unpackImage): UnpackedImageType {
   const FALLBACK_IMAGE = (category == "recipe") ? RECIPE_FALLBACK_IMAGE : USER_FALLBACK_IMAGE
   return {
      src: image ? `${BASE_URL}${image.url}` : FALLBACK_IMAGE,
      alt: "Downloaded image",
      loading: "lazy" as const,
      onError: (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
         error.currentTarget.onerror = null;
         error.currentTarget.src = FALLBACK_IMAGE;
      },
   }
}