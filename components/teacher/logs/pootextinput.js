import React from 'react'
import { TextInput } from 'react-native'

export default class PooTextInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            other_option: '其他'
        }
    }

    componentDidMount() {
        this.setState({
            other_option: '其他'
        }, () => {
            console.log('mounted', this.refs.textRef.isFocused())
        })
    //    this.refs.textRef.focus()
    //    console.log('mounted', this.refs.textRef.isFocused())
    }

    onBlur(other_option) {
        console.log('onBlur')
        this.setState({
            other_option: ''
        })
        this.props.editPooCondition(other_option)
    }

    // componentWillUnmount() {
        
    // }

    render() {
        const { other_option } = this.state
        console.log('other_option ===: ',other_option === '其他')
        return (
            <TextInput
                ref={"textRef"}
                autoFocus={other_option === '其他'}
                selectTextOnFocus={true}
                style={{ fontSize: 30, textAlign: 'center' }}
                // keyboardType='default'
                value={other_option}
                onChangeText={(condition) => this.setState({ other_option: condition})}
                onEndEditing={() => this.props.editPooCondition(other_option)}
                onBlur={() => this.onBlur(other_option)}
            />
        )
    }
}