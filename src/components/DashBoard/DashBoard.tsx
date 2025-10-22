import { useState } from 'react'

export default function DashBoard() {
  const [username, setUsername] = useState("Camilo")

  return (
    <>
      <h2>Hello, {username}!</h2>
      <input onChange={(e) => setUsername(e.target.value)} value={username} />
    </>
  )
}