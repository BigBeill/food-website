import { ServiceStateType } from "../shared.types";
import ErrorPage from "./stateComponents/ErrorPage";
import LoadingPage from "./stateComponents/LoadingPage";
import NotFoundPage from "./stateComponents/NotFoundPage";

interface RequireServiceStateReadyProps<T> {
   serviceState: ServiceStateType<T>;
   children: (data: T) => React.ReactNode;
}

export default function RequireServiceStateReady<T>({ serviceState, children }: RequireServiceStateReadyProps<T>) {
   switch (serviceState.status) {
      case 'loading':
         return <LoadingPage />
      case 'not-found':
         return <NotFoundPage />
      case 'error':
         return <ErrorPage />
      case 'ready':
         return <>{children(serviceState.data)}</>
   }
}