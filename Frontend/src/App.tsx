
import { useEffect } from 'react'
import './App.css'

function App() {
  const server = 'http://localhost:8000'
  useEffect(() => {
    async function checkHealth(){
      const res = await fetch(`${server}/health`, {
        method:"GET"
      })

      const data = await res.json()
      console.log(data.message)
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
