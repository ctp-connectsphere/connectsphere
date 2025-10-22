import { useState } from 'react'
import DashBoard from './components/DashBoard/DashBoard'
import NavBar from './components/NavBar/NavBar'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavBar />
      <main>
        <h1>Welcome back, user!</h1>
        <div className="card">
          <DashBoard />
        </div>
      </main>
    </>
  )
}

export default App
