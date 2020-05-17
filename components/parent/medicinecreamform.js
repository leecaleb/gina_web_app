import React from 'react'
import { View, Text, TouchableHighlight, TextInput } from 'react-native'

export default class MedicineCreamForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      藥膏: ''
    }
  }

  componentDidMount() {
    const { 藥膏 } = this.props
    this.setState({
      藥膏
    })
  }

  render() {
    const { 藥膏 } = this.state
    const {width, height} = this.props
    return (
      <View style={{ flex: 4, backgroundColor: 'rgba(255,255,255,0.4)' }}>
        <View style={{ flex: 3, margin: 14, backgroundColor: '#ffddb7' }}>
          <View style={{ height: height, flexDirection: 'row',  flexDirection: 'row' }}>
            <View
              style={{
                width,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <Text style={{ fontSize: 25 }}>藥膏</Text>
            </View>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -20 }}>
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center' }}>
              <TextInput
                style={{ fontSize: 40, padding: 10 }}
                placeholder='部位'
                autoFocus
                selectTextOnFocus
                value={藥膏}
                onChangeText={(area) => this.setState({ 藥膏: area })}
              />
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableHighlight
                style={{
                  height: '70%',
                  aspectRatio: 2,
                  padding: 5,
                  backgroundColor: '#fa625f',
                  justifyContent: 'center'
                }}
                onPress={() => this.props.onCancelSelect()}
              >
                <Text style={{ fontSize: 20, textAlign: 'center' }}>取消選取</Text>
              </TouchableHighlight>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableHighlight
                style={{
                  height: '70%',
                  aspectRatio: 2,
                  padding: 5,
                  backgroundColor: '#00c07f',
                  justifyContent: 'center'
                }}
                onPress={() => this.props.onFinishEdit(藥膏)}
              >
                <Text style={{ fontSize: 25, textAlign: 'center' }}>OK</Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </View>
    )
  }
}