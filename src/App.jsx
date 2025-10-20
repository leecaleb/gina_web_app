import { useState, useEffect } from 'react'
import { Amplify } from 'aws-amplify'
import { getCurrentUser } from 'aws-amplify/auth'
import AuthLoading from './components/auth/AuthLoading'
import Login from './components/auth/Login'
import ParentApp from './components/parent/ParentApp'
import TeacherApp from './components/teacher/TeacherApp'
import './App.css'

// Configure Amplify (you'll need to add your config)
// Amplify.configure(awsConfig)

function App() {
  const [authState, setAuthState] = useState({
    status: 'loading',
    user: null,
    role: null,
    id: null,
    username: ''
  })

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    setAuthState(prev => ({ ...prev, status: 'loading' }))
    
    try {
      // Check for local demo user first
      const localUser = localStorage.getItem('demoUser')
      if (localUser) {
        const userData = JSON.parse(localUser)
        console.log('Local demo user found:', userData.username)
        await fetchUserRole(userData.username)
        return
      }

      // If no local user, try Amplify (for production)
      const currentUser = await getCurrentUser()
      console.log('Amplify user:', currentUser.username)
      await fetchUserRole(currentUser.username)
      
    } catch (error) {
      console.log('User not authenticated:', error)
      setAuthState({
        status: 'signedout',
        user: null,
        role: null,
        id: null,
        username: ''
      })
    }
  }

  const fetchUserRole = async (username) => {
    try {
      // For demo purposes - replace with actual API call
      // const response = await fetch(`https://your-api.com/user?username=${username}`)
      // const data = await response.json()
      
      // Demo logic: determine role based on username
      let role, id
      if (username.includes('parent') || username === 'demo') {
        role = 'parent'
        id = 'parent_123'
      } else if (username.includes('teacher') || username.includes('school')) {
        role = 'school'
        id = 'school_456'
      } else {
        role = 'parent' // default
        id = 'user_789'
      }

      setAuthState({
        status: role,
        user: { username },
        role: role,
        id: id,
        username: username
      })
      
    } catch (error) {
      console.error('Error fetching user role:', error)
      setAuthState(prev => ({ ...prev, status: 'signedout' }))
    }
  }

  const handleSignOut = async () => {
    try {
      // Clear local demo user
      localStorage.removeItem('demoUser')
      
      // For production - replace with actual Amplify signOut
      // await signOut()
      
      setAuthState({
        status: 'signedout',
        user: null,
        role: null,
        id: null,
        username: ''
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const changeAuthState = (status, username = '') => {
    setAuthState(prev => ({
      ...prev,
      status,
      username
    }))
  }

  const { status, id, username } = authState

  // Role-based conditional rendering
  if (status === 'loading') {
    return <AuthLoading />
  }

  if (status.includes('parent')) {
    return (
      <ParentApp 
        parent_id={id} 
        handleSignOut={handleSignOut}
      />
    )
  }

  if (status === 'school') {
    return (
      <TeacherApp 
        school_id={id} 
        school_name={username} 
        handleSignOut={handleSignOut}
      />
    )
  }

  if (status === 'signedout') {
    return (
      <Login 
        onAuthSuccess={checkAuthState}
        changeAuthState={changeAuthState}
      />
    )
  }

  // Default loading state
  return <AuthLoading />
}

export default App
