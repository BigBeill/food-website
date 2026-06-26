import AuthProvider from '@/features/auth/providers/AuthProvider';
import Nav from '@/shared/components/Navbar';
import './globals.scss';
import './displayData.scss';
import './inputs.scss';
import './objectView.scss';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({children}: LayoutProps) {
   return(
      <html lang="en">
         <body>
            <AuthProvider>
               <Nav/>
               <main>
                  {children}
               </main>
            </AuthProvider>
         </body>
      </html>
   )
}