import React from 'react'
import { View, Text, TouchableHighlight, StyleSheet, ScrollView } from 'react-native'
import Header from '../../header'
import { useNavigate, useLocation } from 'react-router-dom'

const AdminHome = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  // static navigationOptions = ({ navigation }) => {
  //   return {
  //     headerTitle: <Header title={'Admin Home'} />
  //   }
  // }

  const handleNavigate = (pageName) => {
    // console.log(pageName)
    const { school_name, school_id, email } = location?.state
    navigate(pageName, { state: { 
        school_name,
        school_id,
        email
      }}
    )

    // props.navigation.push(pageName)
  }

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
      <TouchableHighlight
        style={styles.button}
        onPress={()=> handleNavigate('announcement')}
        underlayColor="#368cbf"
      >
        <Text style={{ fontSize: 70 }}>公告</Text>
      </TouchableHighlight>
      
      <TouchableHighlight
        style={styles.button}
        onPress={()=> handleNavigate('Registration')}
        underlayColor="#368cbf"
      >
        <Text style={{ fontSize: 70 }}>新生註冊</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.button}
        onPress={()=> handleNavigate('Students')}
        underlayColor="#368cbf"
      >
        <Text style={{ fontSize: 70 }}>學生資料</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.button}
        onPress={()=> handleNavigate('Teachers')}
        underlayColor="#368cbf"
      >
        <Text style={{ fontSize: 70 }}>教師資料</Text>
      </TouchableHighlight>

      <TouchableHighlight
        style={styles.button}
        onPress={()=> handleNavigate('DownloadPage')}
        underlayColor="#368cbf"
      >
        <Text style={{ fontSize: 70 }}>下載</Text>
      </TouchableHighlight>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  button: {
    // flex: 1,
    width: '80%',
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b5e9e9',
    marginVertical: 20
  },
  button_text: {

  }
})

export default AdminHome