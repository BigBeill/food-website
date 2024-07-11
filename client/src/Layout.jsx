import {Outlet} from 'react-router-dom'
import Nav from './components/Nav'

export default function Layout({userData}){
  return(
    <>
      <header />
      <Nav userData={userData}/>
      <main>
        <Outlet />
      </main>
    </>
  )
}
