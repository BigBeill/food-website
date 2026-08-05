import { useCallback, useState } from "react";
import { ServiceStateType } from "../shared.types";

export type ServiceMutationReturnType<TInput, TOutput> = ServiceStateType<TOutput> & {
   send: (input: TInput) => Promise<TOutput>;
   resetToIdle: () => void;
   overrideOutput: (output: TOutput) => void;
}

export function useServiceMutation<TInput, TOutput>(mutationFunction: (input: TInput) => Promise<TOutput>): ServiceMutationReturnType<TInput, TOutput> {
   const [state, setState] = useState<ServiceStateType<TOutput>>({ status: 'idle' });

   // returns data both directly and indirectly in case await is needed
   const send = useCallback((input: TInput): Promise<TOutput> => {
      setState({ status: 'loading' });

      const sendPromise = (async () => {
         try {
            const data = await mutationFunction(input);
            setState({ status: 'ready', data });
            return data;
         }
         catch (error) {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            setState({ status: 'error', error: normalizedError });
            throw normalizedError;
         }
      })();

      sendPromise.catch(() => {});

      return sendPromise;
   },[mutationFunction]);

   function resetToIdle() {
      setState({ status: 'idle' });
   }

   const overrideOutput = useCallback((output: TOutput) => {
      setState({ status: 'ready', data: output })
   },[]);

   return {
      ...state,
      send, 
      resetToIdle,
      overrideOutput
   };
}