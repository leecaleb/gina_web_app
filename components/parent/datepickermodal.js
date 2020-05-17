import React from 'react'
import { View, Text, DatePickerIOS, Modal, TouchableHighlight } from 'react-native'

export default class DatePickerModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
            date: new Date()
        }
        this.setDate = this.setDate.bind(this)
        this.hideModal = this.hideModal.bind(this)
    }

    setDate (date) {
        this.setState({ date: date})
    }

    hideModal () {
        this.props.modalVisible == 1 ? this.props.setStartDate(this.state.date) : this.props.setEndDate(this.state.date)
        this.props.setModalVisible(0)
    }
    
    render () {
        return (
            <View>
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={this.props.modalVisible > 0}
                    >
                        <View style={{ flex: 1, marginTop: 100 ,borderColor: '#000000',justifyContent: 'center'}}>
                            <DatePickerIOS
                                date={this.state.date}
                                onDateChange={this.setDate}/>
                        </View>
                        <TouchableHighlight 
                            style={{ alignItems: 'center', padding: 100 }}
                            underlayColor='transparent'
                            onPress={this.hideModal}>
                            <Text style={{ fontSize: 20}}>Ok</Text>
                        </TouchableHighlight>
                    </Modal>
                    
                </View>
        )
    }
}