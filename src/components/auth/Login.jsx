import { useState } from 'react'
import { signIn } from 'aws-amplify/auth'

const Login = ({ onAuthSuccess, changeAuthState }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // For demo purposes - replace with actual Amplify auth
      const validCredentials = [
        { username: 'demo', password: 'demo', role: 'parent' },
        { username: 'parent', password: 'parent', role: 'parent' },
        { username: 'teacher', password: 'teacher', role: 'school' },
        { username: 'school', password: 'school', role: 'school' }
      ]

      const credential = validCredentials.find(
        cred => cred.username === formData.username && cred.password === formData.password
      )

      if (credential) {
        // Store user in localStorage for demo purposes
        const userData = {
          username: formData.username,
          role: credential.role,
          authenticated: true,
          loginTime: new Date().toISOString()
        }
        localStorage.setItem('demoUser', JSON.stringify(userData))
        
        // Simulate successful login with role
        setTimeout(() => {
          onAuthSuccess()
        }, 1000)
      } else {
        throw new Error('Invalid credentials. Try: demo/demo, parent/parent, teacher/teacher, or school/school')
      }
      
      // Uncomment when you have Amplify configured:
      // await signIn({ username: formData.username, password: formData.password })
      // onAuthSuccess()
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>🔐 Sign In to Gina</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Enter username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter password"
          />
        </div>

        {error && <div className="error">{error}</div>}
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Demo Accounts:</h4>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div><strong>Parent:</strong> demo/demo or parent/parent</div>
          <div><strong>Teacher:</strong> teacher/teacher or school/school</div>
        </div>
      </div>
    </div>
  )
}

export default Login
