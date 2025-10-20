import { useState } from 'react'

const TeacherApp = ({ school_id, school_name, handleSignOut }) => {
  const [loading, setLoading] = useState(false)

  const onSignOut = async () => {
    setLoading(true)
    try {
      await handleSignOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏫 Teacher Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            School: {school_name} | ID: {school_id}
          </span>
          <button 
            onClick={onSignOut} 
            className="btn"
            disabled={loading}
            style={{ width: 'auto' }}
          >
            {loading ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h3>👥 My Students</h3>
          <p>View and manage your class roster, student information, and profiles.</p>
          <button className="btn">View Students</button>
        </div>

        <div className="card">
          <h3>✅ Attendance</h3>
          <p>Take daily attendance and manage student check-ins and check-outs.</p>
          <button className="btn">Take Attendance</button>
        </div>

        <div className="card">
          <h3>📝 Daily Reports</h3>
          <p>Create and submit daily activity reports for each student.</p>
          <button className="btn">Create Reports</button>
        </div>

        <div className="card">
          <h3>🍽️ Meal Tracking</h3>
          <p>Record student meal consumption, appetite, and dietary notes.</p>
          <button className="btn">Track Meals</button>
        </div>

        <div className="card">
          <h3>😴 Nap Time</h3>
          <p>Log nap times, sleep duration, and rest periods for students.</p>
          <button className="btn">Log Naps</button>
        </div>

        <div className="card">
          <h3>🚽 Restroom Logs</h3>
          <p>Track restroom visits and potty training progress.</p>
          <button className="btn">Log Restroom</button>
        </div>

        <div className="card">
          <h3>💊 Medications</h3>
          <p>Manage and administer student medications safely and accurately.</p>
          <button className="btn">Manage Medications</button>
        </div>

        <div className="card">
          <h3>📢 Announcements</h3>
          <p>Create and publish announcements for parents and administrators.</p>
          <button className="btn">Create Announcement</button>
        </div>

        <div className="card">
          <h3>💬 Parent Communication</h3>
          <p>Send messages and updates to parents about their children.</p>
          <button className="btn">Message Parents</button>
        </div>

        <div className="card">
          <h3>📊 Analytics</h3>
          <p>View class statistics, attendance trends, and student progress.</p>
          <button className="btn">View Analytics</button>
        </div>

        <div className="card">
          <h3>📱 QR Scanner</h3>
          <p>Scan parent QR codes for secure pickup verification.</p>
          <button className="btn">Open Scanner</button>
        </div>

        <div className="card">
          <h3>⚙️ Settings</h3>
          <p>Manage class settings, preferences, and notification options.</p>
          <button className="btn">Class Settings</button>
        </div>
      </div>
    </div>
  )
}

export default TeacherApp
