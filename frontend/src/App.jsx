import React from 'react'
import { Routes,Route } from 'react-router-dom'
import  SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

function App() {
  return (
    <div>
      <Routes>
        <Route path = '/signup' element ={<SignUp></SignUp>}> </Route>
        <Route path = '/signin' element ={<SignIn></SignIn>}> </Route>
      </Routes>
     
    </div>
  )
}

export default App
