import React from 'react'
import { Container, View, Text, Card, CardItem, Item, Input, Button, Toast } from 'native-base'
import { TouchableHighlight, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { markTeacherLoggedIn, markTeacherLoggedOut } from '../../redux/school/actions/index'

class LoginNumberPad extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            passcode: '',
            err_message: '',
            number_array: [1,2,3,4,5,6,7,8,9]
        }
        this.handlePasscode = this.handlePasscode.bind(this)
    }

    handlePasscode(num) {
        this.setState({ passcode: this.state.passcode + num })
    }

    handleEnterPasscode() {
        this.props.handleEnterPasscode(this.state.passcode)
        this.setState({ passcode: '' })
    }

    render() {
        const {passcode, number_array} = this.state
        return (
            <TouchableHighlight
                style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    width: '100%',
                    height: '100%',
                    // // opacity: 0.5,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2,
                    position: 'absolute',
                }}
                underlayColor='transparent'
                onPress={this.props.hideLoginPad}
            >
                <TouchableHighlight
                    style={{ width: 350, height: 560, borderRadius: 25, zIndex: 3, position: 'absolute', backgroundColor: 'white' }}
                    underlayColor='white'
                    onPress={() => { }}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ flex: 1, flexDirection: 'row', width: 310, height: 100, margin: 5, borderRadius: 50, backgroundColor: '#b5e9e9', justifyContent: 'center' }}>
                            <Text style={{ width: 210, fontSize: 40, fontWeight: 'bold', paddingHorizontal: 20, alignSelf: 'center' }}>{passcode}</Text>
                            <TouchableHighlight
                                style={{ width: 100, height: 100, margin: 5, borderRadius: 50, backgroundColor: '#ffe1d0', justifyContent: 'center', alignItems: 'center'  }}
                                underlayColor='#fa625f'
                                onPress={() => this.setState({ passcode: '' })}
                            >
                                <Text style={{ fontSize: 30 }} >Clear</Text>
                            </TouchableHighlight>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {number_array.map(number => {
                                return (
                                    <TouchableHighlight
                                        key={number}
                                        style={{ width: 100, height: 100, margin: 5, borderRadius: 50, backgroundColor: '#fff1b5', justifyContent: 'center', alignItems: 'center'  }}
                                        underlayColor='#f4d41f'
                                        onPress={() => this.handlePasscode(number)}
                                    >
                                        <Text style={{ fontSize: 30 }} >{number}</Text>
                                    </TouchableHighlight>
                                )
                            })}
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <TouchableHighlight
                                style={{ width: 100, height: 100, margin: 5, borderRadius: 50, backgroundColor: '#fff1b5', justifyContent: 'center', alignItems: 'center' }}
                                underlayColor='#f4d41f'
                                onPress={() => this.handlePasscode(0)}
                            >
                                <Text style={{ fontSize: 30 }}>0</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={{ width: 210, height: 100, margin: 5, borderRadius: 50, backgroundColor: '#dcf3d0', justifyContent: 'center', alignItems: 'center' }}
                                underlayColor='#00c07f'
                                onPress={() => this.handleEnterPasscode()}
                            >
                                <Text style={{ fontSize: 30 }}>Enter</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </TouchableHighlight>
            </TouchableHighlight>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        minWidth: '22%',
        aspectRatio: 1,
        margin: 5,
        justifyContent: 'center'
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({markTeacherLoggedIn, markTeacherLoggedOut}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (LoginNumberPad)