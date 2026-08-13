import { useRouter } from 'next/navigation';
import useAuth from '@/features/auth/hooks/useAuth';
import LoadingPage from '@/shared/components/stateComponents/Loading.states';
import { useEffect } from 'react';
import ErrorPage from '@/shared/components/stateComponents/Error.states';

export default function RequireNoAuth({ children }: { children: React.ReactNode }) {
   const { authId, status } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (status === "ready" && authId) { router.replace('/'); }
   }, [status, authId, router]);

   switch (status) {
      case 'loading':
         return <LoadingPage />
      case 'error':
         return <ErrorPage />
      case 'ready':
         return <>{children}</>
      }
}