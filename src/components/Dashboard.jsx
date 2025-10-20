import { useState } from 'react'
import { signOut } from 'aws-amplify/auth'

const Dashboard = ({ user, onSignOut }) => {
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      // For demo purposes - replace with actual Amplify auth
      setTimeout(() => {
        onSignOut()
      }, 500)
      
      // Uncomment when you have Amplify configured:
      // await signOut()
      // onSignOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Gina Web App</h1>
        <button 
          onClick={handleSignOut} 
          className="btn"
          disabled={loading}
          style={{ width: 'auto' }}
        >
          {loading ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h3>🏫 School Management</h3>
          <p>Manage school information, announcements, and administrative tasks.</p>
          <button className="btn">Go to School Dashboard</button>
        </div>

        <div className="card">
          <h3>👨‍👩‍👧‍👦 Parent Portal</h3>
          <p>View your child's activities, attendance, and communicate with teachers.</p>
          <button className="btn">Go to Parent Portal</button>
        </div>

        <div className="card">
          <h3>📊 Reports & Analytics</h3>
          <p>View detailed reports and analytics about student progress and activities.</p>
          <button className="btn">View Reports</button>
        </div>

        <div className="card">
          <h3>💊 Medication Requests</h3>
          <p>Submit and track medication requests for students.</p>
          <button className="btn">Manage Medications</button>
        </div>

        <div className="card">
          <h3>📱 QR Code Scanner</h3>
          <p>Scan QR codes for quick check-ins and attendance tracking.</p>
          <button className="btn">Open Scanner</button>
        </div>

        <div className="card">
          <h3>⚙️ Settings</h3>
          <p>Configure app settings, notifications, and user preferences.</p>
          <button className="btn">Open Settings</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
