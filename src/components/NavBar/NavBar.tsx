// import { useState } from 'react'
// ^^ commented until used later

export default function NavBar() {
  return (
    <>
      <nav className="navbar">
        <div className="logo">ConnectSphere</div>
        <ul className="nav-links">
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Find Matches</a></li>
          <li><a href="#">My Groups</a></li>
        </ul>
        <div className="user-info">
          <span className="username">user</span>
          <button className="logout-button">Logout</button>
        </div>
      </nav>
    </>
  )
}