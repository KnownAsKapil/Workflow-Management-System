
import { useEffect } from 'react'
import './App.css'
import { getMe } from './features/auth/auth.api'
import Login from './Pages/login'

function App() {

  useEffect(() => {
    getMe()
    .then((data) => console.log(data))
    .catch((error) => console.log(error))
  }, [])
  return (
    <>
      <h1 className="text-3xl font-bold underline">
    Hello world!
  </h1>
  <Login />
    </>
  )
}

export default App
