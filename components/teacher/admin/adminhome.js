import React from 'react'
import { View, Text, TouchableHighlight, StyleSheet, ScrollView } from 'react-native'
import Header from '../../header'

export default class AdminHome extends React.Component {
  constructor(props) {
    super(props)
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <Header title={'Admin Home'} />
    }
  }

  componentDidMount() {

  }

  handleNavigate(pageName) {
    // console.log(pageName)
    const { school_name, school_id } = this.props.route.params
    this.props.navigation.navigate(pageName, { school_name, school_id })

    // this.props.navigation.push(pageName)
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
        <TouchableHighlight
          style={styles.button}
          onPress={()=> this.handleNavigate('Registration')}
          underlayColor="#368cbf"
        >
          <Text style={{ fontSize: 70 }}>新生註冊</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={()=> this.handleNavigate('Students')}
          underlayColor="#368cbf"
        >
          <Text style={{ fontSize: 70 }}>學生資料</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={()=> this.handleNavigate('Teachers')}
          underlayColor="#368cbf"
        >
          <Text style={{ fontSize: 70 }}>教師資料</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          onPress={()=> this.handleNavigate('DownloadPage')}
          underlayColor="#368cbf"
        >
          <Text style={{ fontSize: 70 }}>下載</Text>
        </TouchableHighlight>
      </ScrollView>
    )
  }
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