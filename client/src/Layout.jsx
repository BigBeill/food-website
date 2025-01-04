// external imports
import {Outlet} from 'react-router-dom'

// internal imports
import Nav from './components/Nav'

export default function Layout({userData}){
  return(
    <>
      <header />
      <Nav userData={userData}/>
      <main>
        <Outlet context={{ userData }}/>
      </main>
    </>
  )
}
