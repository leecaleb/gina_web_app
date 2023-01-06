import React from 'react'
import { View, TouchableHighlight, Text, Platform, Picker, ActionSheetIOS } from 'react-native'
import { ActionSheet } from 'native-base'

export default class PickerComponent extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      selectedIndex: 0
    }
  }

  isIOS() {
    if (Platform.OS === 'ios') {
      return true
    } else return false
  }

  showActionSheet() {
    // this.props.handleOnClick()
    // if (this.isIOS()) {
    //   this.iosShowActionSheet()
    // } else { // android
    //   this.androidShowActionSheet()
    // }
  }

  iosShowActionSheet() {
    const { options } = this.props
    // ActionSheetIOS.showActionSheetWithOptions(
    //   {
    //     options,
    //     cancelButtonIndex: options.length-1
    //   },
    //   (buttonIndex) => {
    //     this.setState({
    //       selectedIndex: buttonIndex
    //     })
    //     this.props.handleSelectValue(options[buttonIndex])
    //   }
    // )
  }

  androidShowActionSheet() {
    const { options } = this.props
    ActionSheet.show(
      {
        options,
        cancelButtonIndex: options.length-1
      },
      buttonIndex => {
        this.setState({ selectedIndex: buttonIndex })
        this.props.handleSelectValue(options[buttonIndex])
      }
    )
  }

  isOtherSelected() {
    const { selectedValue, options } = this.props
    const index = options.indexOf(selectedValue)
    if (index < 0) return true
    return false
  }

  render() {
    const { selectedValue, style, textStyle, disabled } = this.props
    return (
      <TouchableHighlight
        disabled={disabled}
        style={style}
        onPress={() => this.showActionSheet()}
      >
        <Text style={textStyle}>{selectedValue}</Text>
      </TouchableHighlight>
    )
  }
}