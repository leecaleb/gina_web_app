import React from 'react'
import { View, TextInput, StyleSheet, Text, Alert } from 'react-native'
import { Container, Content, Card, Button} from 'native-base'
import Auth from '@aws-amplify/auth'

class ConfirmSignUp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            code: ''
        }
        this.confirmCode = this.confirmCode.bind(this)
    }

    confirmCode() {
        Auth.confirmSignUp(this.props.username, this.state.code)
            .then(data => {
                console.log('data: ', data)
                // switch to homepage
                // save often used ids into asyncstorage
                // this.props.navigation.navigate('AuthLoadingPage')
                this.props.getCurrentUser()
            })
            .catch((err) => {
                Alert.alert(
                    'Error!',
                    err.message,
                    [
                        { text: 'OK', onPress: () => console.log('err occured when setting up account for parent(s): ', err)}
                    ]
                  )
            })
    }

    render() {
        console.log('this.state.code: ', this.state.code)
        return (
            <Container>
                <Content keyboardShouldPersistTaps="always">
                    <View
                        style={{
                            paddingTop: '20%',
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            paddingBottom: '15%'
                        }}
                    >
                        <TextInput
                            style={{ position: 'absolute', color: 'transparent'}}
                            autoFocus={true}
                            maxLength={6}
                            caretHidden={true}
                            keyboardType={'numeric'}
                            onChangeText={(number) => {
                                this.setState({ code: number })
                            }}
                        />
                        {Array(6).fill(0).map((item, index) => {
                            return (
                                <Card key={index} style={{ width: 50, height: 50, backgroundColor: 'white', borderColor: 'black', justifyContent: 'center' }}>
                                    {this.state.code.length > index ? 
                                        <Text style={{ fontSize: 30, alignSelf: 'center' }}>{this.state.code.charAt(index)}</Text>
                                        : <Text></Text>
                                    }
                                </Card>
                            )
                        })}
                    </View>
                    
                    <Button rounded success style={{ alignSelf: 'center' }} onPress={this.confirmCode}>
                        <Text style={{ paddingHorizontal: 5, color: 'white' }}>Confirm code</Text>
                    </Button>
                {/* }} */}
                </Content>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    input: {
        borderColor: 'black',
        borderWidth: 1
    }
})

export default ConfirmSignUp