import { useCallback, useState } from "react";
import { ServiceStateType } from "../shared.types";

export type ServiceMutationReturnType<TInput, TOutput> = ServiceStateType<TOutput> & {
   send: (input: TInput) => Promise<TOutput>;
   resetToIdle: () => void;
}

export function useServiceMutation<TInput, TOutput>(mutationFunction: (input: TInput) => Promise<TOutput>): ServiceMutationReturnType<TInput, TOutput> {
   const [state, setState] = useState<ServiceStateType<TOutput>>({ status: 'idle' });

   // returns data both directly and indirectly in case await is needed
   const send = useCallback(async (input: TInput): Promise<TOutput> => {
      setState({ status: 'loading' });
      try {
         const data = await mutationFunction(input);
         setState({ status: 'ready', data });
         return data;
      } 
      catch (error) {
         if (error instanceof Error) { setState({ status: 'error', error }); }
         else { setState({ status: 'error', error: new Error(String(error)) }); }
         throw error
      }
   },[mutationFunction]);

   function resetToIdle() {
      setState({ status: 'idle' });
   }

   return {
      ...state,
      send, 
      resetToIdle,
   };
}