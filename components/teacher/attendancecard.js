import React from 'react'
import { Card, CardItem, Toast } from 'native-base'
import { View, Text, StyleSheet, Image, TouchableHighlight } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { markAbsent, markPresent } from './../../redux/school/actions/index'
import { formatDate } from './../util'

class AttendanceCard extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            selected_student_ids: []
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    onSelectAttendanceType(attendance_type) {
        const { attendance } = this.props
        switch (attendance_type) {
            case 'present': {
                this.setState({
                    selected_student_ids: [...attendance.present]
                })
                return
            }
            
            case 'absent': {
                this.setState({
                    selected_student_ids: [...attendance.absent]
                })
                return 
            }
                
            case 'unmarked': {
                this.setState({
                    selected_student_ids: [...attendance.unmarked]
                })
                return
            }
        }
    }

    fetchData() {
        const date = formatDate(new Date())

        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/attendance?date=${date}&class_id=${this.props.class.class_id}`
        fetch(query, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(resJson => {
            for (var key in resJson) {
                // {student_id}: [in_time, out_time, excuse_type]
                if(resJson[key][0] !== null) {
                    this.props.markPresent(key, resJson[key][0])
                }
                else if (resJson[key][2] !== null) {
                    this.props.markAbsent(key, resJson[key][2])
                }
            }
            this.setState({
                selected_student_ids: [...this.props.attendance.unmarked]
            })
        })
        .catch(err => console.log('err: ', err))
    }

    handleOnClick(student_id) {
        this.props.showModal(student_id)
    }

    render() {
        // TODO: on unmount, clear redux
        // TODO: way to automatically update absent whenever parents send absense request
        // TODO: what to display on homepage vs what to display in other pages after teachers
        //          click into the attendance status(present, absent, or not yet)
        // console.log(this.props.attendance)
        // console.log(this.props.class.students)
        return (
            <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <CardItem>
                    <Text style={{ fontSize: 30 }}>出席狀況</Text>
                </CardItem>

                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ paddingLeft: 5, paddingTop: 5}}>
                            <Text>出席</Text>
                        </View>
                        <TouchableHighlight
                            style={{
                                flex: 1,
                                alignSelf: 'center',
                                width: '70%',
                                height: '70%',
                                backgroundColor: '#dcf3d0'
                            }}
                            underlayColor='#00c07f'
                            onPress={() => this.onSelectAttendanceType('present')}
                        >
                            <Text 
                                style={{ flex: 1, width: '100%', textAlign: 'center', fontSize: 60 }}
                                adjustsFontSizeToFit={true}
                            >
                                {this.props.attendance.present.size}
                            </Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ paddingLeft: 5, paddingTop: 5}}>
                            <Text>缺席</Text>
                        </View>
                        <TouchableHighlight
                            style={{
                                flex: 1,
                                alignSelf: 'center',
                                width: '70%',
                                height: '70%',
                                backgroundColor: '#ffe1d0'
                            }}
                            underlayColor='#fa625f'
                            onPress={() => this.onSelectAttendanceType('absent')}
                        >
                            <Text 
                                style={{ flex: 1, width: '100%', textAlign: 'center', fontSize: 60 }}
                                adjustsFontSizeToFit={true}
                            >
                                {this.props.attendance.absent.size}
                            </Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ paddingLeft: 5, paddingTop: 5}}>
                            <Text>未知</Text>
                        </View>
                        <TouchableHighlight
                            style={{
                                flex: 1,
                                alignSelf: 'center',
                                width: '70%',
                                height: '70%',
                                backgroundColor: '#fff1b5'
                            }}
                            underlayColor='#f4d41f'
                            onPress={() => this.onSelectAttendanceType('unmarked')}
                        >
                            <Text 
                                style={{ flex: 1, width: '100%', textAlign: 'center', fontSize: 60 }}
                                adjustsFontSizeToFit={true}
                            >
                                {this.props.attendance.unmarked.size}
                            </Text>
                        </TouchableHighlight>
                    </View>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                    {this.state.selected_student_ids.map((student_id) => {
                        const { present, unmarked, absent } = this.props.attendance
                        return (
                            <TouchableHighlight
                                key={student_id}
                                style={{ width: '31%', margin: '1%'}}
                                underlayColor='transparent'
                                onPress={() => this.handleOnClick(student_id)}
                            >
                                <View style={styles.cardContainer}>
                                    <Card>
                                        <CardItem style={{ justifyContent: 'center' }}>
                                                <Image
                                                    source={
                                                        this.props.class.students[student_id].profile_picture === '' ?
                                                            require('../../assets/icon-thumbnail.png')
                                                            : {uri: this.props.class.students[student_id].profile_picture}
                                                    }
                                                    style={{
                                                        height: 200,
                                                        width: 200,
                                                        borderRadius: 100,
                                                        borderWidth: 10,
                                                        borderColor:
                                                            present.has(student_id) ? '#dcf3d0'
                                                                : unmarked.has(student_id) ? '#fff1b5'
                                                                    : '#ffe1d0'
                                                    }}
                                                />
                                        </CardItem>
                                        <CardItem
                                            footer
                                            style={{ justifyContent: 'center', marginTop: -5 }}
                                        >
                                            <Text style={{ marginTop: -10 }}>{this.props.class.students[student_id].name}</Text>
                                        </CardItem>
                                    </Card>
                                </View>
                            </TouchableHighlight>
                        )
                    })}
                </View>
            </Card>
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        paddingVertical: 5
    },
    thumbnailImage: {
        height: 80,
        width: 80,
        borderRadius: 40
    }
})

const mapStateToProps = (state) => {
    return {
        attendance: state.attendance,
        class: state.classInfo
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({markAbsent, markPresent}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true }) (AttendanceCard)