import React from 'react'
import { 
    View, 
    Text,
    TouchableHighlight,
    Dimensions,
    Platform } from 'react-native'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

const { width } = Dimensions.get('window')

export default class TimeModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            datetime: new Date(),
            isLoading: true
            // max_date: (new Date()).setDate((new Date()).getDate() + 7)
        }
    }

    componentDidMount() {
        const { start_date } = this.props
        this.setState({
            datetime: start_date,
            isLoading: false
        })
    }

    isIOS() {
        if (Platform.OS === 'ios') {
          return true
        } else return false
      }

    setDate(datetime) {
        if (this.isIOS()) {
            this.iosSetDate(datetime)
        } else {
            this.androidSetDate(datetime)
        }
        // if (datetime !== undefined) {
        //     this.setState({datetime})
        // } else {
        //     this.props.hideModal()
        // }
    }

    iosSetDate(datetime) {
        this.setState({datetime})
    }

    androidSetDate(datetime) {
        if (datetime !== undefined) {
            this.props.selectDatetimeConfirm(datetime)
        //     this.props.hideModal()
        } else {
            this.props.hideModal()
        }
        // this.props.hideModal()
    }

    selectDatetimeConfirm(date) {
        // const { datetime } = this.state
        this.props.selectDatetimeConfirm(date)
        this.props.hideModal()
    }

    onChange = date => {
        console.log(date)
    }
    
    isWeekday = date => {
        const special_date = new Date('June 20, 2020')
        const day = date.getDay()
        return (day !== 0 && day !== 6) || date.toDateString() === special_date.toDateString();
    };

    render() {
        const { datetime_type, minDatetime, maxDatetime, minTime, maxTime, paddingVertical } = this.props
        const { datetime, isLoading } = this.state
        if (isLoading) {
            return null
        }
        return (
            <TouchableHighlight
                style={{ 
                    width: '100%',
                    height: '100%', 
                    zIndex: 2,
                    position: 'absolute',
                    paddingVertical,
                    // justifyContent: 'center', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(0,0,0,0.7)' 
                }}
                // onPress={() => this.props.hideModal()}
            >
                <View style={{ }}>
                    {datetime_type === 'date' &&
                        <DatePicker
                            onChange={(date) => this.selectDatetimeConfirm(date)}
                            inline
                            selected={datetime}
                            minDate={new Date(minDatetime)}
                            maxDate={new Date(maxDatetime)}
                            onClickOutside={() => this.props.hideModal()}
                            filterDate={this.isWeekday}
                        />
                    }

                    {datetime_type === 'time' && 
                        <DatePicker
                            onChange={(time) => this.selectDatetimeConfirm(time)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            selected={datetime}
                            minTime={minTime}
                            maxTime={maxTime}
                            onClickOutside={() => this.props.hideModal()}
                        />
                    }
                </View>
            </TouchableHighlight>
        )
    }
}