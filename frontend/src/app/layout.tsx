import AuthProvider from '@/features/auth/providers/AuthProvider';
import '../shared/styles/globals.scss';
import './displayData.scss';
import './objectView.scss';
import Header from '@/shared/components/Header';
import { verifySession } from '@/features/auth/server/session';

interface LayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default async function Layout({ children, modal }: LayoutProps) {

   const session = await verifySession();

   return(
      <html lang="en">
         <body>
            <AuthProvider>
               <Header authenticated={ (session !== null) }/>
               <main>
                  { children }
               </main>
            </AuthProvider>
         </body>
      </html>
   )
}