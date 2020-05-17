import React from 'react'
import { View, Text, TouchableHighlight, Dimensions } from 'react-native'
const { width } = Dimensions.get('window')

export default class MedicinePowderForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      藥粉: 0
    }
  }

  componentDidMount() {
    const { 藥粉 } = this.props
    this.setState({
      藥粉: parseInt(藥粉)
    })
  }

  render() {
    const { 藥粉 } = this.state
    const {width, height} = this.props
    return (
      <View style={{ flex: 4, backgroundColor: 'rgba(255,255,255,0.4)' }}>
        <View style={{ flex: 3, margin: 14, backgroundColor: '#ffddb7' }}>
          <View style={{ height: height, flexDirection: 'row',  flexDirection: 'row' }}>
            <View
              style={{
                width,
                // backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <Text style={{ fontSize: 25 }}>藥粉</Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableHighlight
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                height: height*0.8,
                aspectRatio: 1,
                justifyContent: 'center',
                borderRadius: height*0.4
              }}
              onPress={() => this.setState({
                藥粉: 藥粉 === 0 ? 0 : 藥粉-1
              })}
            >
              <Text style={{ fontSize: 25, textAlign: 'center', color: 'white' }}>-</Text>
            </TouchableHighlight>

            <Text style={{ fontSize: 40, paddingHorizontal: 15 }}>{藥粉} 包</Text>

            <TouchableHighlight
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                height: height*0.8,
                aspectRatio: 1,
                justifyContent: 'center',
                borderRadius: height*0.4
              }}
              onPress={() => this.setState({
                藥粉: 藥粉+1
              })}
            >
              <Text style={{ fontSize: 25, textAlign: 'center', color: 'white' }}>+</Text>
            </TouchableHighlight>
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
                <Text style={{ fontSize: width*0.12, textAlign: 'center' }}>取消選取</Text>
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
                onPress={() => this.props.onFinishEdit(藥粉)}
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