import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { editProfilePicture } from '../../redux/parent/actions'

const ParentHomeTitle = ({ 
  student_id, 
  student, 
  student_name, 
  selectOtherChildProfile, 
  viewQRCode, 
  temperature 
}) => {
  const dispatch = useDispatch()
  const [currentTemp, setCurrentTemp] = useState('')

  useEffect(() => {
    setCurrentTemp(temperature || '')
  }, [temperature])

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Create a preview URL for immediate display
    const imageUrl = URL.createObjectURL(file)
    
    // In a real app, you would upload to your server here
    // For demo purposes, we'll just update the Redux state
    dispatch(editProfilePicture(student_id, imageUrl))
    
    // Clean up the object URL after a delay to prevent memory leaks
    setTimeout(() => URL.revokeObjectURL(imageUrl), 1000)
  }

  return (
    <div className="parent-home-title">
      <div className="student-info-card">
        <div className="profile-section">
          <div className="profile-image-container">
            <input
              type="file"
              id={`profile-upload-${student_id}`}
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor={`profile-upload-${student_id}`} className="profile-image-label">
              <img
                src={student?.profile_picture || '/gina_web_app/default-avatar.png'}
                alt={student_name}
                className="profile-image"
                onError={(e) => {
                  e.target.src = '/gina_web_app/default-avatar.png'
                }}
              />
              <div className="profile-overlay">
                <span>📷</span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="student-details">
          <div className="student-name-section">
            <h2 className="student-name">{student_name}</h2>
          </div>
          
          <div className="temperature-qr-section">
            <div className="temperature-display">
              <div className="temp-label">早上體溫</div>
              <div className="temp-value">
                {currentTemp === '' ? '未量' : `${currentTemp}°`}
              </div>
            </div>
            
            <button 
              className="qr-button"
              onClick={viewQRCode}
              title="View QR Code"
            >
              <img src="/gina_web_app/icon-qr.png" alt="QR Code" style={{width: '32px', height: '32px'}} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="child-selector-card">
        <button 
          className="child-selector-button"
          onClick={selectOtherChildProfile}
          title="Select Other Child"
        >
          <img src="/gina_web_app/icon-babies.png" alt="Select Child" style={{width: '40px', height: '40px'}} />
        </button>
      </div>
    </div>
  )
}

export default ParentHomeTitle
