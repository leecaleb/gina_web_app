import React from 'react'
import { View, TouchableHighlight, Image, Text} from 'react-native'
import { Card } from 'native-base'

export default class ParentHomeTitle extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      temperature: '',
      borderRadius: 0
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.temperature !== prevProps.temperature) {
      this.setState({ temperature: this.props.temperature })
    }
  }

  render() {
    const { temperature, borderRadius } = this.state
    const { student, student_name } = this.props
    return (
      <View style={{ width: '97%', marginLeft: '3%', alignSelf: 'flex-start', flexDirection: 'row'}}>
        <Card style={{ flexDirection: 'row', width: '85%', alignItems: 'center', paddingVertical: 15 }}>
          <View 
            style={{
              flex: 1,
              width: '50%',
              alignItems: 'center'
            }}
            onLayout={(event) => {
              var {width} = event.nativeEvent.layout
              this.setState({ borderRadius: width/2})
            }}
          >
            <Image
                source={
                    student.profile_picture === '' ?
                        require('../../assets/icon-thumbnail.png')
                        : { uri: student.profile_picture }
                    }
                style={
                  student.profile_picture === '' ?
                    { width: 130, height: 130 }
                    : { width: 130, height: 130, borderRadius: 65 }
                }
            />
          </View>
          <View style={{ height: '90%', width: '50%', paddingLeft: 10 }}>
            <View style={{ flex: 1}}>
              <View style={{ height: '50%', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 40 }}>{student_name}</Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', paddingTop: 5 }}>
                <View style={{ flex: 1, height: '100%', backgroundColor: '#F5F5F5', justifyContent: 'center' }}>
                  <Text style={{ padding: 5 }}>早上體溫</Text>
                  <Text style={{ fontSize: 30, textAlign: 'center' }}>
                    {temperature === '' ? '未量' : `${temperature}°`}
                  </Text>
                </View>
                <TouchableHighlight
                  style={{ backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => this.props.viewQRCode()}
                >
                  <Image
                    source={require('../../assets/icon-qr.png')}
                    style={{
                        width: 65,
                        height: 65,
                    }}
                  />
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Card>
        <Card style={{ width: '20%'}}>
          <TouchableHighlight
            style={{ flex: 1, justifyContent: 'center', paddingLeft: 5 }}
            underlayColor='#F5F5F5'
            onPress={() => this.props.selectOtherChildProfile()}
          >
            <Image
              source={require('../../assets/icon-babies.png')}
              style={{
                width: 43,
                height: 43,
                opacity: 0.6
              }}
            />
          </TouchableHighlight>
        </Card>
      </View>
    )
  }
}
