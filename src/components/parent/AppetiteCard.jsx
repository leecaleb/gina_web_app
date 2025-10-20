import React, { useState, useEffect } from 'react'

const AppetiteCard = ({ child_id, date }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [appetiteData, setAppetiteData] = useState(null)
  const [breakfast, setBreakfast] = useState(null)
  const [fruit, setFruit] = useState(null)
  const [lunch, setLunch] = useState(null)
  const [snack, setSnack] = useState(null)
  const [fruitName, setFruitName] = useState('水果')

  useEffect(() => {
    if (date && child_id) {
      fetchData(child_id, new Date(date.getTime()))
    }
  }, [date, child_id])

  const fetchData = async (child_id, date) => {
    // Only show data after 5 PM
    if (date.getHours() < 17) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // For demo purposes, simulate API call
      // Replace with actual API call: const response = await fetchData('appetite', child_id, start_date, end_date)
      
      // Demo data
      const demoData = {
        success: true,
        data: {
          [formatDate(date)]: {
            fruit_name: '蘋果',
            breakfast_rating: 'Good1',
            fruit_rating: 'Awesome1',
            lunch_rating: 'Good0',
            snack_rating: 'Ok1'
          }
        }
      }

      if (demoData.success) {
        denormalizeAppetiteData(demoData.data, date)
      }
    } catch (error) {
      console.error('Error fetching appetite data:', error)
      setIsLoading(false)
    }
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const denormalizeAppetiteData = (appetiteData, date) => {
    const today = formatDate(date)
    if (appetiteData && appetiteData[today]) {
      const { fruit_name, breakfast_rating, fruit_rating, lunch_rating, snack_rating } = appetiteData[today]
      
      setFruitName(fruit_name)
      setBreakfast(parseData(breakfast_rating))
      setFruit(parseData(fruit_rating))
      setLunch(parseData(lunch_rating))
      setSnack(parseData(snack_rating))
      setAppetiteData(appetiteData)
    } else {
      setAppetiteData(appetiteData)
    }
    setIsLoading(false)
  }

  const parseData = (data_string) => {
    if (!data_string) return null
    const rating = data_string.slice(0, -1)
    const water_drunk = parseInt(data_string.slice(-1))
    return {
      rating,
      water_drunk
    }
  }

  const today = date ? formatDate(date) : null

  const MealItem = ({ title, data }) => {
    if (!data) return null
    
    return (
      <div className="meal-item">
        <div className="meal-header">
          <span className="meal-title">{title}</span>
        </div>
        <div className="meal-rating">
          <span className="rating-text">{data.rating || ' '}</span>
        </div>
        <div className="meal-water">
          <span className="water-text">
            {data.water_drunk ? '有喝水' : ' '}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="card-icon">
          <img src="/gina_web_app/icon-appetite.png" alt="Appetite" />
        </div>
        <div className="card-body">
          <div className="card-title">
            <h3>飲食</h3>
          </div>
          {isLoading ? (
            <div className="loading">載入中...</div>
          ) : appetiteData && today && appetiteData[today] ? (
            <div className="appetite-details">
              <div className="meal-row">
                <MealItem title="早餐" data={breakfast} />
                <MealItem 
                  title={fruitName !== '水果' ? `水果餐: ${fruitName}` : '水果'} 
                  data={fruit} 
                />
              </div>
              <div className="meal-row">
                <MealItem title="午餐" data={lunch} />
                <MealItem title="點心" data={snack} />
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

export default AppetiteCard
