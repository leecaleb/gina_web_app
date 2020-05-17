import React from 'react'
// import { db } from '../../configuration/db'
import { View, StyleSheet, Text, KeyboardAvoidingView, TextInput, AsyncStorage, TouchableHighlight } from 'react-native'
import { Button } from 'native-base'
// import firebase from 'firebase'
// import { addCurrentUser, addUserType } from '../../redux/actions/index'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Auth from '@aws-amplify/auth'

class Signup extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            name: '',
            user_type: '',
            email: '',
            password: '',
            errMessage: ''
        }
    }

    handleSignup() {
        const {username, password, name, email, user_type} = this.state
        if (!this.state.user_type) {
            this.setState({ errMessage: 'Please select user role'})
        } else {
            Auth.signUp({
                username,
                password,
                attributes: {
                    name,
                    email
                }
            })
                .then((data) => {
                    // console.log(data)
                    // switch to code input page
                    // initialize user in database and recorde user id 
                    // for use later to switch to homepage upon successful code input
                    console.log(this.state.user_type)

                    fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/user/' + username, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name,
                            email,
                            role: user_type
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
                })
                .catch((err) => {
                    this.setState({ errMessage: err.message })
                })            
        }
    }

    setUserRole (role) {
        this.setState({ user_type: role })
    }

    render () {
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View style={{ width: '45%', marginBottom:20, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <TouchableHighlight style={{ width: 80, height: 85 }}
                        onPress={() => {this.setUserRole('teacher')}}>
                        <Icon
                            name='food-apple'
                            size={80}
                            color='#C93D1B'>
                        </Icon>
                        {/* <Text>Teacher</Text> */}
                    </TouchableHighlight>
                    <TouchableHighlight style={{ width: 80, height: 85 }}
                        onPress={() => {this.setUserRole('parent')}}>
                        <Icon
                            name='baby-buggy'
                            size={80}
                            color='#f8c43a'>
                        </Icon>
                        {/* <Text>Parent</Text> */}
                    </TouchableHighlight>
                </View>
                <Text>{this.state.user_type} Sign Up</Text>
                {this.state.errMessage === '' ?
                    null 
                : <Text style={{ color: 'red' }}>
                    {this.state.errMessage}
                </Text>}

                <TextInput
                    placeholder="username"
                    style={styles.textInput}
                    onChangeText={(username) => this.setState({ username })}
                    value={this.state.username}
                />
                <TextInput
                    secureTextEntry
                    placeholder="password"
                    style={styles.textInput}
                    onChangeText={(password) => this.setState({ password })}
                    value={this.state.password}
                />
                <TextInput
                    placeholder="Name"
                    style={styles.textInput}
                    onChangeText={(name) => this.setState({ name })}
                    value={this.state.name}
                />
                <TextInput
                    placeholder="Email"
                    style={styles.textInput}
                    onChangeText={(email) => this.setState({ email })}
                    value={this.state.email}
                />
                
                <View style={{ width: '90%', margin: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <TouchableHighlight style={{ backgroundColor: '#35D0BA' }} onPress={this.handleSignup.bind(this)}>
                        <Text>Sign up</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={{ backgroundColor: '#35D0BA' }} onPress={() => this.props.changeAuthState('signedout')}>
                        <Text> Already have an account? Sign in here</Text>
                    </TouchableHighlight>
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

// export default connect(mapStateToProps, mapDispatchToProps) (Signup)
export default Signup