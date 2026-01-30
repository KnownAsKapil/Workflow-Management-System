
import { useEffect } from 'react'
import './App.css'

function App() {
  const server = 'http://localhost:8000/api/v1'
  useEffect(() => {
    async function checkHealth(){
      const res = await fetch(`${server}/tasks`, {
        method:"GET"
      })

      const response = await res.json()
      console.log(response.data)
    }
    checkHealth();
  }, [])
  return (
    <>
      <h1 className="text-3xl font-bold underline">
    Hello world!
  </h1>
    </>
  )
}

export default App
