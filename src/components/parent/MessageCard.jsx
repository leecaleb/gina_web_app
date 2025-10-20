import React, { useState, useEffect } from 'react'

const MessageCard = ({ child_id, date, class_id, parent_id }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [dataAvailable, setDataAvailable] = useState(false)
  const [itemsToBring, setItemsToBring] = useState([])
  const [activities, setActivities] = useState([])
  const [text, setText] = useState('')
  const [messageForTeacher, setMessageForTeacher] = useState('')
  const [teacherId, setTeacherId] = useState('')

  useEffect(() => {
    if (date && child_id) {
      fetchMessageData(child_id, new Date(date.getTime()))
    }
  }, [date, child_id])

  const fetchMessageData = async (child_id, propDate) => {
    let date = new Date(propDate.getTime())
    
    // Only show data after 5 PM
    if (date.getHours() < 17) {
      setIsLoading(false)
      setDataAvailable(false)
      return
    }

    setIsLoading(true)
    try {
      // For demo purposes, simulate API call
      // Replace with actual API call: const response = await fetchData('message', child_id, start_date, end_date)
      
      // Demo data
      const demoData = {
        success: true,
        data: {
          [formatDate(date)]: {
            items_to_bring: [true, false, true, false, true], // 母奶粉, 尿布, 水壺, 衣物, other
            other_item: '小毯子',
            activities: [true, false, true, true, false, false, true, false], // Various activities
            text: '今天寶寶表現很好，午睡時間很安穩。',
            teacher_id: 'teacher_123'
          }
        }
      }

      if (demoData.success && demoData.data[formatDate(date)]) {
        denormalize(demoData.data[formatDate(date)])
      } else {
        setDataAvailable(false)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching message data:', error)
      setDataAvailable(false)
      setIsLoading(false)
    }
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const denormalize = (message_data) => {
    const items_list = ['母奶粉', '尿布', '水壺', '衣物']
    const activities_list = ['嬰兒按摩', '音樂律動', '教具操作', '繪本欣賞', '認知圖片', '體能活動', '藝術創作', '多元語言']
    
    const items_to_bring = []
    const activities = []

    // Process items to bring
    for (let i = 0; i < message_data.items_to_bring.length - 1; i++) {
      if (message_data.items_to_bring[i]) {
        items_to_bring.push(items_list[i])
      }
    }

    if (message_data.items_to_bring[message_data.items_to_bring.length - 1]) {
      items_to_bring.push(message_data.other_item)
    }

    // Process activities
    for (let i = 0; i < message_data.activities.length; i++) {
      if (message_data.activities[i]) {
        activities.push(activities_list[i])
      }
    }

    setItemsToBring(items_to_bring)
    setActivities(activities)
    setText(message_data.text || '')
    setTeacherId(message_data.teacher_id || '')
    setDataAvailable(true)
    setIsLoading(false)
  }

  const sendMessageToTeacher = async () => {
    if (!messageForTeacher.trim()) return

    try {
      // For demo purposes, simulate API call
      // Replace with actual API call: const response = await post('/message', {...})
      
      console.log('Sending message to teacher:', messageForTeacher)
      alert('訊息已送出給老師')
      setMessageForTeacher('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('訊息送出失敗，請稍後再試')
    }
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="card-icon">
          <img src="/gina_web_app/icon-message.png" alt="Message" />
        </div>
        <div className="card-body">
          <div className="card-title">
            <h3>老師的話</h3>
          </div>
          {isLoading ? (
            <div className="loading">載入中...</div>
          ) : dataAvailable ? (
            <div className="message-details">
              {text && (
                <div className="teacher-message">
                  <div className="message-label">老師說：</div>
                  <div className="message-text">{text}</div>
                </div>
              )}

              {itemsToBring.length > 0 && (
                <div className="items-section">
                  <div className="section-label">明天請帶：</div>
                  <div className="items-list">
                    {itemsToBring.map((item, index) => (
                      <span key={index} className="item-tag">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {activities.length > 0 && (
                <div className="activities-section">
                  <div className="section-label">今日活動：</div>
                  <div className="activities-list">
                    {activities.map((activity, index) => (
                      <span key={index} className="activity-tag">{activity}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="parent-message-section">
                <div className="section-label">回覆老師：</div>
                <textarea
                  className="message-input"
                  value={messageForTeacher}
                  onChange={(e) => setMessageForTeacher(e.target.value)}
                  placeholder="輸入想對老師說的話..."
                  rows={3}
                />
                <button 
                  className="send-button"
                  onClick={sendMessageToTeacher}
                  disabled={!messageForTeacher.trim()}
                >
                  送出
                </button>
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

export default MessageCard
