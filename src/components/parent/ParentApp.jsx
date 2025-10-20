import { useState } from 'react'
import ParentHome from './ParentHome'

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
    <div className="parent-app">
      <div className="app-header">
        <h1>👨‍👩‍👧‍👦 Parent Portal</h1>
        <div className="header-actions">
          <span className="parent-id">Parent ID: {parent_id}</span>
          <button 
            onClick={onSignOut} 
            className="sign-out-btn"
            disabled={loading}
          >
            {loading ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>

      <ParentHome 
        parent_id={parent_id}
        handleSignOut={handleSignOut}
      />
    </div>
  )
}

export default ParentApp
