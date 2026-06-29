import AuthProvider from '@/features/auth/providers/AuthProvider';
import '../shared/styles/globals.scss';
import './displayData.scss';
import './inputs.scss';
import './objectView.scss';
import NavigationBar from '@/shared/components/NavigationBar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({children}: LayoutProps) {
   return(
      <html lang="en">
         <body>
            <AuthProvider>
               <NavigationBar/>
               <main>
                  {children}
               </main>
            </AuthProvider>
         </body>
      </html>
   )
}