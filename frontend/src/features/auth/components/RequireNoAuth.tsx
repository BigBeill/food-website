import { useRouter } from 'next/navigation';
import useAuth from '@/features/auth/hooks/useAuth';
import LoadingPage from '@/shared/components/stateComponents/LoadingPage';
import { useEffect } from 'react';

export default function RequireNoAuth({ children }: { children: React.ReactNode }) {
   const { authId, loading } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && authId) { router.replace('/'); }
   }, [loading, authId, router]);

   if (loading) { return <LoadingPage /> }
   else if (authId) { return null; }
   else { return <>{children}</>; }
}