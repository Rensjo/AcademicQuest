import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="app-container">
      {/* Global app shell would go here (like persistent navigation) */}
      <Outlet />
    </div>
  )
}