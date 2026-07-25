import { useState } from "react";
import { ServiceStateType } from "../shared.types";

export interface ServiceMutationType<TInput, TOutput> {
   state: ServiceStateType<TOutput>;
   send: (input: TInput) => Promise<void>;
   resetToIdle: () => void;
}

export function useServiceMutation<TInput, TOutput>(mutationFunction: (input: TInput) => Promise<TOutput>) {
   const [state, setState] = useState<ServiceStateType<TOutput>>({ status: 'idle' });

   async function send(input: TInput) {
      setState({ status: 'loading' });
      try {
         const data = await mutationFunction(input);
         setState({ status: 'ready', data });
      } 
      catch (error) {
         if (error instanceof Error) { setState({ status: 'error', error }); }
         else { setState({ status: 'error', error: new Error(String(error)) }); }
      }
   }

   function resetToIdle() {
      setState({ status: 'idle' });
   }

   return { state, send, resetToIdle };
}