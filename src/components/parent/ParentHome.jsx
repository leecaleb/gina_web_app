import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { initializeChildren, markPresent, clearState } from '../../redux/parent/actions'
import ParentHomeTitle from './ParentHomeTitle'
import AttendanceCard from './AttendanceCard'
import AppetiteCard from './AppetiteCard'
import MessageCard from './MessageCard'

const ParentHome = ({ parent_id, handleSignOut }) => {
  const dispatch = useDispatch()
  const { child_of_id, isConnected } = useSelector(state => state.parent.parent)
  
  const [date, setDate] = useState(new Date())
  const [childId, setChildId] = useState('child_1')
  const [temperature, setTemperature] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Use useMemo to derive selectedStudent from Redux state
  const selectedStudent = useMemo(() => {
    if (childId && child_of_id && child_of_id[childId]) {
      return child_of_id[childId]
    }
    return null
  }, [childId, child_of_id])

  useEffect(() => {
    // Initialize with demo children data only once
    if (!initialized) {
      const demoChildren = [
        {
          id: 'child_1',
          name: '小明',
          class_id: 'class_1',
          profile_picture: '',
          school_id: 'school_1',
          school_name: '快樂幼兒園'
        }
      ]
      
      dispatch(initializeChildren(demoChildren))
      setInitialized(true)
    }
  }, [dispatch, initialized])

  const beautifyDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    }
    return date.toLocaleDateString('zh-TW', options)
  }

  const goBackADay = () => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() - 1)
    setDate(newDate)
  }

  const goForwardADay = () => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 1)
    setDate(newDate)
  }

  const markPresentWithTemp = (temp) => {
    setTemperature(temp)
    if (childId) {
      dispatch(markPresent(childId))
    }
  }

  const selectOtherChildProfile = () => {
    // For demo purposes, just cycle through available children
    const childIds = Object.keys(child_of_id)
    if (childIds.length > 1) {
      const currentIndex = childIds.indexOf(childId)
      const nextIndex = (currentIndex + 1) % childIds.length
      setChildId(childIds[nextIndex])
    }
  }

  const viewQRCode = () => {
    setShowQR(true)
  }

  if (!selectedStudent) {
    return (
      <div className="parent-home loading">
        <div>載入中...</div>
      </div>
    )
  }

  return (
    <div className="parent-home">
      <div className="date-navigation">
        <button 
          className="nav-button"
          onClick={goBackADay}
        >
          <img src="/gina_web_app/icon-back.png" alt="Previous Day" style={{width: '20px', height: '20px'}} />
        </button>
        <div className="date-display">
          <h2>{beautifyDate(date)}</h2>
        </div>
        <button 
          className="nav-button"
          onClick={goForwardADay}
          disabled={date >= new Date()}
        >
          <img src="/gina_web_app/icon-forward.png" alt="Next Day" style={{width: '20px', height: '20px'}} />
        </button>
      </div>

      <ParentHomeTitle
        student_id={childId}
        student={selectedStudent}
        student_name={selectedStudent.name}
        selectOtherChildProfile={selectOtherChildProfile}
        viewQRCode={viewQRCode}
        temperature={temperature}
      />

      <div className="action-buttons">
        <button className="action-btn pickup">
          接回告知
        </button>
        <button className="action-btn medication">
          托藥單
        </button>
        <button className="action-btn absence">
          請假單
        </button>
      </div>

      <div className="cards-container">
        <AttendanceCard
          student_id={childId}
          date={date}
        />

        <MessageCard
          child_id={childId}
          date={date}
          class_id={selectedStudent.class_id}
          parent_id={parent_id}
        />

        <AppetiteCard
          child_id={childId}
          date={date}
        />
      </div>

      {showQR && (
        <div className="qr-modal" onClick={() => setShowQR(false)}>
          <div className="qr-content" onClick={e => e.stopPropagation()}>
            <h3>QR Code</h3>
            <div className="qr-placeholder">
              📱 QR Code would appear here
            </div>
            <button onClick={() => setShowQR(false)}>關閉</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParentHome
