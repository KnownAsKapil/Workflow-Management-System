
import { useEffect } from 'react'
import './App.css'
import { getMe } from './features/auth/auth.api'
import Login from './Pages/Login.tsx'
import TasksPage from './Pages/TasksPage.tsx'

function App() {

  useEffect(() => {
    getMe()
    .then((data) => console.log(data))
    .catch((error) => console.log(error))
  }, [])
  return (
    <>
  <Login />
  <TasksPage />
    </>
  )
}

export default App
