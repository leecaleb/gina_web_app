import React from 'react'
import { StyleSheet, Image } from 'react-native'
import { Container, Content, Text, View, Card, CardItem } from 'native-base'
import { connect } from 'react-redux'
import Header from '../../header'
import { bindActionCreators } from 'redux';
import { markAbsent, markPresent } from '../../../redux/school/actions/index'
import { formatDate } from '../../util'

class Attendance extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            attendanceObj: {}
        }
        this.checkStudentAbsenceRequest = this.checkStudentAbsenceRequest.bind(this)
    }

    static navigationOptions = {
        headerTitle: <Header title={'出席'} />,
    }

    
    componentDidMount () {
        this.checkStudentAbsenceRequest()
    }

    checkStudentAbsenceRequest() {
        /**
            check if any student_id in 'unmarked' set has any absence excuse
         */
        const date = formatDate(new Date())
            // date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
        let ids = ''
        this.props.attendance.unmarked.forEach((student_id) => {
            ids += '&id=' + student_id
        })

        if(ids === '') {
            return
        }

        fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/attendance?date=' + date + ids, {
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
        })
        .catch(err => console.log('err: ', err))
    }

    render() {
        // console.log(this.props.class)
        console.log(this.props.attendance)
        return (
            <Container>
                <Content contentContainerStyle={{ flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap' }}>
                    {Object.keys(this.props.class.students).map((student_id) => {
                        var obj = this.props.attendance.attendance[student_id]
                        return (
                            <View
                                key={student_id}
                                style={styles.cardContainer}
                            >
                                <Card>
                                    <CardItem style={{ justifyContent: 'center' }}>
                                        <Image
                                            source={{ uri: this.props.class.students[student_id].profile_picture }}
                                            style={styles.thumbnailImage}/>
                                    </CardItem>
                                    <CardItem
                                        footer
                                        style={{ justifyContent: 'center', backgroundColor: (obj) ? (obj['present'] ? '#dcf3d0' : '#ffe1d0') : '#eaebed' }}>
                                        <Text>{this.props.class.students[student_id].f_name}</Text>
                                    </CardItem>
                                </Card>
                            </View>
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
        class: state.classInfo,
        attendance: state.attendance
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({markAbsent, markPresent}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (Attendance)