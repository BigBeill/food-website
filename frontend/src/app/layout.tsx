import AuthProvider from '@/features/auth/providers/AuthProvider';
import '../shared/styles/globals.scss';
import './displayData.scss';
import './objectView.scss';
import Header from '@/shared/components/Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {

   return(
      <html lang="en">
         <body>
            <AuthProvider>
               <Header/>
               <main>
                  { children }
               </main>
            </AuthProvider>
         </body>
      </html>
   )
}