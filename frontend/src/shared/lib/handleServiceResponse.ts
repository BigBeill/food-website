import { notFound } from "next/navigation";
import { ErrorNotFound } from "./errorClasses";

export default async function preRenderService<T>(serviceCall: () => Promise<T>): Promise<T> {
   try { return await serviceCall(); }
   catch (error) {
      if (error instanceof ErrorNotFound) { notFound(); }
      throw error;
   }
}