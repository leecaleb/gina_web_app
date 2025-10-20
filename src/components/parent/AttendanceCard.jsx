import React, { useState, useEffect } from 'react'

const AttendanceCard = ({ student_id, date }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [inTime, setInTime] = useState(null)
  const [outTime, setOutTime] = useState(null)
  const [excuseType, setExcuseType] = useState(null)
  const [absenceTime, setAbsenceTime] = useState(null)
  
  const timeLabels = {
    'morning': '早上',
    'evening': '下午',
    'all_day': '全天'
  }

  useEffect(() => {
    if (date && student_id) {
      fetchAttendanceByStudentId(date)
    }
  }, [date, student_id])

  const fetchAttendanceByStudentId = async (date) => {
    setIsLoading(true)
    try {
      // For demo purposes, simulate API call
      // Replace with actual API call: const response = await get(`/attendance/${student_id}?date=${formatDate(date)}`)
      
      // Demo data
      const demoData = {
        success: true,
        data: {
          in_time: '08:30',
          out_time: '17:15',
          excuse_type: null,
          absence_time: null
        }
      }

      if (demoData.success) {
        let { in_time, out_time, excuse_type, absence_time } = demoData.data
        if (excuse_type === 'none-medical') {
          excuse_type = '事假'
        }
        setInTime(in_time)
        setOutTime(out_time)
        setExcuseType(excuse_type)
        setAbsenceTime(absence_time)
      } else {
        setInTime(null)
        setOutTime(null)
        setExcuseType(null)
        setAbsenceTime(null)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      setInTime(null)
      setOutTime(null)
      setExcuseType(null)
      setAbsenceTime(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="card-icon">
          <img src="/gina_web_app/icon-attendance.png" alt="Attendance" />
        </div>
        <div className="card-body">
          <div className="card-title">
            <h3>出勤</h3>
          </div>
          {isLoading ? (
            <div className="loading">載入中...</div>
          ) : inTime !== null || outTime !== null || excuseType !== null ? (
            <div className="attendance-details">
              {excuseType !== null && (
                <div className="excuse-info">
                  <span className="excuse-text">
                    請假: {excuseType} ({timeLabels[absenceTime]})
                  </span>
                </div>
              )}
              <div className="time-info">
                <div className="time-item">
                  <div className="time-label">到校</div>
                  {inTime !== null && (
                    <div className="time-value">{inTime}</div>
                  )}
                </div>
                <div className="time-item">
                  <div className="time-label">離校</div>
                  {outTime !== null && (
                    <div className="time-value">{outTime}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-records">
              <span>沒有新紀錄</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceCard
