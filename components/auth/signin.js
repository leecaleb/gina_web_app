import React from 'react'
import { StyleSheet, TextInput, Platform, KeyboardAvoidingView, TouchableHighlight, Image } from 'react-native'
import { View, Text } from 'native-base'
import Auth from '@aws-amplify/auth'
import Reloading from '../reloading'

class Signin extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            errMessage: '',
            user_type: '',
            isLoading: false
        }
    }

    componentDidMount() {
        // this.props.clearState
    }

    handleSignIn() {
        // invoke google auth with scopes, ask for school's authorization
        // allow requests to googple photo api
        this.setState({
            isLoading: true
        })
        const { username, password } = this.state
        Auth.signIn(username, password)
            .then((user) => {
                if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                    // const {requiredAttributes} = user.challengeParam
                    this.completeNewPassword(user)
                    return
                }
                this.setState({
                    isLoading: false
                })
                this.props.loadAuth()
            })
            .catch((err) => {
                if (err.code === 'UserNotConfirmedException') {
                    this.props.changeAuthState('ConfirmSignUpPage', username)
                } else {
                    this.props.changeAuthState('signedout', username)
                    this.setState({ 
                        errMessage: err.message,
                        isLoading: false
                    })
                }
            })
    }

    completeNewPassword(user) {
        Auth.completeNewPassword(
            user,
            'barRoco',
            { name: 'barroco' }
        )
        .then((user) => {
            this.setState({
                isLoading: false
            })
            this.props.loadAuth()
        })
        .catch((err) => {
            this.setState({
                errMessage: err.message,
                isLoading: false
            })
        })
    }

    render () {
        const { isLoading } = this.state
        if (isLoading) {
            return (
                <Reloading />
            )
        }
        const keyboardVerticalOffset = Platform.OS === 'ios' ? 60 : 0
        const errMessage = this.state.errMessage ? (
            <Text style={{ color: 'red'}}>
                {this.state.errMessage}
            </Text>
        ) : (
            null
        )

        return (
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={'padding'}
                keyboardVerticalOffset={keyboardVerticalOffset} 
                enabled
            >
                <Image
                    source={require('../../assets/app_logo.png')}
                    style={{
                        width: 200,
                        height: 200,
                    }}
                />

                <Text style={{ fontSize: 40 }}>請登入</Text>
                {errMessage}
                <TextInput
                    placeholder="Email / 帳號"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                    onChangeText={(username) => this.setState({ username })}
                    value={this.state.username}
                />

                <TextInput
                    secureTextEntry
                    placeholder="密碼"
                    style={styles.textInput}
                    onChangeText={(pass) => this.setState({ password: pass })}
                    value={this.state.password}
                />

                <View style={{ marginTop: 20 }}>
                    <TouchableHighlight
                        style={{ backgroundColor: 'grey', padding: 20 }}
                        onPress={() => this.handleSignIn()}
                    >
                        <Text style={{ fontSize: 30 }}>登入</Text>
                    </TouchableHighlight>
                </View>
                
                {/*<View style={{ width: '90%', margin: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Button style={{ backgroundColor: '#35D0BA' }} onPress={() => this.handleSignIn('','')}>
                        <Text>Sign in</Text>
                    </Button>
                    <Button style={{ backgroundColor: '#35D0BA' }} onPress={() => this.props.changeAuthState('SignupPage', '')}>
                        <Text>No Account? Sign up here!</Text>
                    </Button>
                </View>
                <Button style={{ backgroundColor: '#35D0BA' }} onPress={() => this.handleSignIn('abc123', 'password')}>
                    <Text>我是家長</Text>
                </Button>
                <Button style={{ backgroundColor: '#35D0BA' }} onPress={() => this.handleSignIn('formosa', 'formosaADMIN')}>
                    <Text>我是校方</Text>
                </Button>*/}
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
        height: 80,
        width: '90%',
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 20,
        fontSize: 30,
        padding: 10
    }
})

// const mapDispatchToProps = (dispatch) => {
//     return {
//         ...bindActionCreators({addUserType, clearState}, dispatch)
//     }
// }

// function mapStateToProps(state) {
//     return({
//         user: state.user
//     })
// }

// export default connect(mapStateToProps, mapDispatchToProps) (Signin)
export default Signin