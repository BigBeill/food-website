import { useState } from "react";

export function useServiceMutation<TInput, TOutput>(mutationFunction: (input: TInput) => Promise<TOutput>) {
   const [state, setState] = useState<ServiceState<TOutput>>({ status: 'idle' });

   async function send(input: TInput) {
      setState({ status: 'loading' });
      try {
         const data = await mutationFunction(input);
         setState({ status: 'ready', data });
      } catch (error) {
         setState({ status: 'error', error });
      }
   }

   function resetToIdle() {
      setState({ status: 'idle' });
   }

   return { state, send, resetToIdle };
}