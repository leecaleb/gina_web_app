import React from 'react'
import { StyleSheet, Image, TouchableHighlight } from 'react-native'
import { Container, Content, Text, View, Card, CardItem, Toast } from 'native-base'
import { connect } from 'react-redux'
import LoginNumberPad from './loginnumberpad'
import { bindActionCreators } from 'redux';
import { markTeacherLoggedIn, markTeacherLoggedOut, markStaffAttendanceFail, fetchAttendanceSuccess } from '../../redux/school/actions/index'

class TeacherClockInOut extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            logging_in: false,
            teacher_id: ''
        }
        this.handleEnterPasscode = this.handleEnterPasscode.bind(this)
        this.hideLoginPad = this.hideLoginPad.bind(this)
    }

    componentDidMount() {
        this.fetchStaffAttendanceByClassId()
    }

    fetchStaffAttendanceByClassId() {
        const { class_id, isConnected } = this.props.class
        if (!isConnected) {
            Toast.show({
                text: '拍謝 網路連不到! 等一下再試試看',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
                duration: 5000
            })
            return
        }
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/staff-attendance?class_id=${class_id}`
        fetch(query, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                this.props.fetchAttendanceSuccess(resJson.data)
            })
            .catch(err => {
                console.log('err: ', err)
            })

    }

    handleEnterPasscode(passcode) {
        const teacher_id = this.props.class.passcodeTeacherId[passcode]
        if (teacher_id === undefined || teacher_id !== this.state.teacher_id) {
            Toast.show({
                text: 'Wrong password!',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
                duration: 3000
            })
        } else {
            const teacher = this.props.class.teachers[teacher_id]
            const time = new Date()
            if (teacher.logged_in) {
                this.clockOut(teacher_id, time)
            } else {
                this.clockIn(teacher_id, time)
            }
            this.setState({ logging_in: false })
        }
        
    }

    clockIn(staff_id, time) {
        const { isConnected } = this.props.class
        if (!isConnected) {
            Toast.show({
                text: '拍謝 網路連不到! 等一下再試試看',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
                duration: 5000
            })
            return
        }
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/staff-attendance`
        fetch(query, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                staff_id
            })
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message, data } = resJson
                if ( statusCode > 200 || resJson["message"] === "Internal server error") {
                    this.props.markStaffAttendanceFail(message)
                } else {
                    this.props.markTeacherLoggedIn(staff_id, time, data.attendance_id)
                }
            })
            .catch(err => {
                console.log('err: ', err)
            })
    }

    clockOut(staff_id, time) {
        const { isConnected } = this.props.class
        if (!isConnected) {
            Toast.show({
                text: '拍謝 網路連不到! 等一下再試試看',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
                duration: 5000
            })
            return
        }

        const { attendance_id } = this.props.class.teachers[staff_id]
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/staff-attendance/${attendance_id}`
        fetch(query, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message } = resJson
                if (statusCode > 200 || message === "Internal server error") {
                    this.props.markStaffAttendanceFail(message)
                }
                else {
                    this.props.markTeacherLoggedOut(staff_id, time)
                }
            })
            .catch(err => {
                console.log('err: ', err)
            })
    }

    hideLoginPad() {
        this.setState({ logging_in: false })
    }

    render() {
        const { errMessage } = this.props.class
        return(
            <Container>
                {errMessage !== '' ?    
                    <Text style={{ fontSize: 20, color: 'red' }}>{errMessage}</Text>
                    : null}
                {this.state.logging_in ?
                    <LoginNumberPad
                        handleEnterPasscode={(passcode) => this.handleEnterPasscode(passcode)}
                        hideLoginPad={this.hideLoginPad}
                    /> : null}
                        
                <Content contentContainerStyle={{ marginTop: 30, paddingBottom: 30, alignSelf: 'center', flexDirection: 'row' }}>
                    {Object.keys(this.props.class.teachers).map((teacher_id) => {
                        return (
                            <TouchableHighlight
                                key={teacher_id}
                                style={{ margin: 20 }}
                                underlayColor='transparent'
                                onPress={() => this.setState({ logging_in: true, teacher_id: teacher_id})}
                            >
                                <View style={styles.cardContainer}>
                                    <Card>
                                        <CardItem style={{ justifyContent: 'center' }}>
                                            <Image
                                                // source={{ uri: this.props.class.students[student_id].profile_picture }}
                                                style={styles.thumbnailImage}/>
                                        </CardItem>
                                        <CardItem
                                            footer
                                            style={{ justifyContent: 'center', backgroundColor: this.props.class.teachers[teacher_id].logged_in ? '#dcf3d0' : '#ffe1d0' }}>
                                            <Text>{this.props.class.teachers[teacher_id].name}</Text>
                                        </CardItem>
                                    </Card>
                                </View>
                            </TouchableHighlight>
                        )
                    })}
                </Content>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 119,
        height: 150,
        margin: 2,
        marginBottom: -2
    },
    thumbnailImage: {
        height: 80,
        width: 80,
        borderRadius: 40
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({markTeacherLoggedIn, markTeacherLoggedOut, markStaffAttendanceFail, fetchAttendanceSuccess}, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps) (TeacherClockInOut)