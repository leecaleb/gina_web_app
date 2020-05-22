import React from 'react'
import { StyleSheet, Text, KeyboardAvoidingView, TextInput, AsyncStorage } from 'react-native'
import { View, Button } from 'native-base'
// import { addCurrentUser, addUserType } from '../../redux/actions/index'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Auth from '@aws-amplify/auth'

class RegisterNewStudent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            f_name: '',
            l_name: '',
            email: '',
            password: '',
            errMessage: null
        }
    }

    handleSignup () {
      Promise.all([
        Auth.signUp({
          username: 'abc123',
          password: 'pasS!3pa',
          attributes: {
              given_name: 'test1',
              family_name: 'bailey',
              email: 'caleb7947@gmail.com'
          }
        }),
        Auth.signUp({
          username: 'def456',
          password: 'pasS3pa',
          attributes: {
              given_name: 'test2',
              family_name: 'bailey',
              email: 'caleb7947@gmail.com'
          }
        })
      ])
      .then(values => {
        console.log(values)
      })
      .catch(err => {
        console.log('err occured when setting up account for parent(s): ', err)
      })
      // Auth.signUp({
      //     username: 'mb',
      //     password: 'pasS!3pa',
      //     attributes: {
      //         given_name: 'miranda',
      //         family_name: 'bailey',
      //         email: 'caleb7947@gmail.com'
      //     }
      // })
      // .then((data) => {
      //     // console.log(data)
      //     // switch to code input page
      //     // initialize user in database and record user id 
      //     // for use later to switch to homepage upon successful code input
      //     console.log()

      //     
      // })
      // .catch((err) => {
      //     this.setState({ errMessage: err.message })
      // })
    }

    handleSaveInDB() {
      fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/family/', {
          method: 'POST',
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              firstName: 'miranda',
              lastName: 'bailey',
              email: 'caleb7947@gmail.com',
              role: this.state.user_type
          })
      })
      .then((response) => response.json())
      .then((responseJson) => {
          console.log(responseJson)
          // this.props.navigation.navigate('ConfirmSignUpPage', {role: this.state.user_type})
          this.props.changeAuthState('ConfirmSignUpPage')
      })
      .catch((err) => {
          console.error(err)
      })
    }

    render () {
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <Text>{this.state.user_type} Sign Up</Text>
                {this.state.errMessage &&
                <Text style={{ color: 'red' }}>
                    {this.state.errMessage}
                </Text>}
                {/* <TextInput
                    placeholder="username"
                    style={styles.textInput}
                    onChangeText={(username) => this.setState({ username: username })}
                    value={this.state.username}
                />
                <TextInput
                    secureTextEntry
                    placeholder="password"
                    style={styles.textInput}
                    onChangeText={(password) => this.setState({ password: password })}
                    value={this.state.password}
                />
                <TextInput
                    placeholder="First Name"
                    style={styles.textInput}
                    onChangeText={(f_name) => this.setState({ f_name: f_name })}
                    value={this.state.f_name}
                />
                <TextInput
                    placeholder="Last Name"
                    style={styles.textInput}
                    onChangeText={(l_name) => this.setState({ l_name: l_name })}
                    value={this.state.l_name}
                />
                <TextInput
                    placeholder="Email"
                    style={styles.textInput}
                    onChangeText={(email) => this.setState({ email: email })}
                    value={this.state.email}
                /> */}
                
                <View style={{ width: '90%', margin: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Button style={{ backgroundColor: '#35D0BA' }} onPress={this.handleSignup.bind(this)}>
                        <Text>Sign up</Text>
                    </Button>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        height: 40,
        width: '90%',
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 8
    }
})

// const mapDispatchToProps = (dispatch) => {
//     return {
//         ...bindActionCreators({ addCurrentUser, addUserType }, dispatch)
//     }
// }

// function mapStateToProps(state) {
//     return({
//         user: state.user
//     })
// }

// export default connect(mapStateToProps, mapDispatchToProps) (RegisterNewStudent)
export default RegisterNewStudent