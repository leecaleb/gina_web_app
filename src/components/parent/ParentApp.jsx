import { useState } from 'react'

const ParentApp = ({ parent_id, handleSignOut }) => {
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
        <h1>👨‍👩‍👧‍👦 Parent Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            Parent ID: {parent_id}
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
          <h3>👶 My Children</h3>
          <p>View information about your children, their classes, and teachers.</p>
          <button className="btn">View Children</button>
        </div>

        <div className="card">
          <h3>📅 Attendance</h3>
          <p>Check your child's attendance records and submit absence excuses.</p>
          <button className="btn">View Attendance</button>
        </div>

        <div className="card">
          <h3>🍎 Daily Activities</h3>
          <p>See what your child did today - meals, naps, activities, and more.</p>
          <button className="btn">View Activities</button>
        </div>

        <div className="card">
          <h3>💊 Medication Requests</h3>
          <p>Submit and track medication requests for your child.</p>
          <button className="btn">Manage Medications</button>
        </div>

        <div className="card">
          <h3>📢 Announcements</h3>
          <p>Read important announcements from your child's school and teachers.</p>
          <button className="btn">View Announcements</button>
        </div>

        <div className="card">
          <h3>💬 Messages</h3>
          <p>Communicate with teachers and school administrators.</p>
          <button className="btn">View Messages</button>
        </div>

        <div className="card">
          <h3>🚗 Pickup Requests</h3>
          <p>Submit early pickup requests and manage pickup authorizations.</p>
          <button className="btn">Manage Pickups</button>
        </div>

        <div className="card">
          <h3>📊 Reports</h3>
          <p>View detailed reports about your child's progress and development.</p>
          <button className="btn">View Reports</button>
        </div>

        <div className="card">
          <h3>📱 QR Code</h3>
          <p>Use QR code for quick check-ins and pickup verification.</p>
          <button className="btn">Show QR Code</button>
        </div>
      </div>
    </div>
  )
}

export default ParentApp
