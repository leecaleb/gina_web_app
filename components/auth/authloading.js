import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import * as Font from 'expo-font'
import Auth from '@aws-amplify/auth'
import SchoolApp from '../teacher/schoolapp'
import Signin from './signin'
import Signup from './signup'
import ParentApp from '../parent/parentapp'
import ConfirmSignUp from './confirmsignup'
import Reloading from '../reloading'
import { YellowBox } from 'react-native';
import ENV from '../../variables'

YellowBox.ignoreWarnings([
    'Non-serializable values were found in the navigation state',
]);

class AuthLoading extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            status: '',
            id: '',
            username: ''
        }
        this.getCurrentUser = this.getCurrentUser.bind(this)
    }

    async componentDidMount() {
        await Font.loadAsync({
            'Roboto': require('../../node_modules/native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
        })
        this.getCurrentUser()
    }

    getCurrentUser() {
        this.setState({ status: 'loading' })
        // console.log('loadAuth')
        Auth.currentAuthenticatedUser()
            .then(user => {
                //user is authenticated
                console.log(user.username)
                fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/user?username=${user.username}`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                    .then((res) => res.json())
                    .then((resJson) => {
                        // get id, name, role of admin and parents
                        const { statusCode, message, data } = resJson
                        // console.log('resJson: ', resJson)
                        if (statusCode === 200) {
                            this.setState({
                                status: data.role,
                                id: data.id,
                                username: user.username
                            })
                        } else {
                            this.setState({
                                status: 'signedout'
                            })
                        }
                    })
                    .catch((err) => {
                        console.log('err: ', err)
                        this.setState({ status: 'signedout' })
                    })
            })
            .catch(err => {
                if (err == 'not authenticated') {
                    this.setState({ status: 'signedout' })
                }
                this.setState({ status: 'signedout' })
            })
    }

    changeAuthState(state, username) {
        this.setState({
            status: state,
            username
        })
    }

    handleSignOut() {
        Auth.signOut()
            .then(() => {
                this.getCurrentUser()
            })
            .catch(err => console.log(err))
    }

    render() {
        console.log('ENV: ', ENV)
        const { status, username } = this.state
        console.log('status: ', status)
        return (
            <View style={{ flex: 1 }}>
                {
                    status.includes('parent') ?
                        <ParentApp parent_id={this.state.id} handleSignOut={() => this.handleSignOut()}/>
                        : status === 'school' ? 
                            <SchoolApp school_id={this.state.id} school_name={username} handleSignOut={() => this.handleSignOut()} />
                            : status === 'ConfirmSignUpPage' ?
                                <ConfirmSignUp getCurrentUser={this.getCurrentUser} username={this.state.username}/>
                                : status === 'signedout' || status === 'school' ?
                                    <Signin loadAuth={this.getCurrentUser} changeAuthState={(state,username) => this.changeAuthState(state, username)} />
                                    :
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text>Loading...</Text>
                                            <ActivityIndicator size="large"></ActivityIndicator>
                                        </View>
                }
            </View>
        )
    }
}

// const mapDispatchToProps = (dispatch) => {
//     return ({
//         ...bindActionCreators({ initializeClass }, dispatch)
//     })
// }

// export default connect(null, mapDispatchToProps) (AuthLoading)
export default AuthLoading