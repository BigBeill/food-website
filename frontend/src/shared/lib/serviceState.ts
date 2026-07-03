import { useEffect, useRef, useState } from "react";

export default function useServiceState<T>(fetcher: () => Promise<T>, refetchOn: unknown[]): ServiceState<T> {
   const [state, setState] = useState<ServiceState<T>>({ status: 'loading' });
   const requestIdRef = useRef(0);

   useEffect(() => {
      const requestId = ++requestIdRef.current;
      setState({ status: 'loading' });

      fetcher()
         .then(data => {
            if (requestIdRef.current !== requestId) { return; }
            setState(data ? { status: 'ready', data } : { status: 'not-found' });
         })
         .catch(error => {
            if (requestIdRef.current !== requestId) { return; }
            setState({ status: 'error', error });
         });
   }, refetchOn);

   return state;
}