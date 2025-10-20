import React from 'react'

const AuthLoading = () => {
  return (
    <div className="loading-container">
      <h2>Loading...</h2>
      <div className="spinner"></div>
      <p>Checking authentication status...</p>
    </div>
  )
}

export default AuthLoading
