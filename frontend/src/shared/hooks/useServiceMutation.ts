import { useCallback, useEffect, useRef, useState } from "react";
import { ServiceStateType } from "../shared.types";

export type ServiceMutationReturnType<TInput, TOutput> = ServiceStateType<TOutput> & {
   send: (input: TInput) => Promise<TOutput>;
   resetToIdle: () => void;
   overrideOutput: (output: TOutput) => void;
}

export function useServiceMutation<TInput, TOutput>(mutationFunction: (input: TInput) => Promise<TOutput>): ServiceMutationReturnType<TInput, TOutput> {
   const [state, setState] = useState<ServiceStateType<TOutput>>({ status: 'idle' });

   const mutationFunctionRef = useRef(mutationFunction);
   useEffect(() => { mutationFunctionRef.current = mutationFunction; });

   const requestIdRef = useRef(0);

   // returns data both directly and indirectly in case await is needed
   const send = useCallback((input: TInput): Promise<TOutput> => {
      const requestId = ++requestIdRef.current;
      setState({ status: 'loading' });

      const sendPromise = (async () => {
         try {
            const data = await mutationFunctionRef.current(input);
            if (requestId === requestIdRef.current) { setState({ status: 'ready', data }); }
            return data;
         }
         catch (error) {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            if(requestId === requestIdRef.current) { setState({ status: 'error', error: normalizedError }); }
            throw normalizedError;
         }
      })();

      sendPromise.catch(() => {});

      return sendPromise;
   },[]);

   function resetToIdle() {
      requestIdRef.current += 1;
      setState({ status: 'idle' });
   }

   const overrideOutput = useCallback((output: TOutput) => {
      requestIdRef.current += 1;
      setState({ status: 'ready', data: output })
   },[]);

   return {
      ...state,
      send, 
      resetToIdle,
      overrideOutput
   };
}