import React from 'react'
import { View, Text, StyleSheet, Image, TouchableHighlight, ScrollView, Alert } from 'react-native'
import { Card } from 'native-base'
import { connect } from 'react-redux'
import { beautifyTime } from '../util'

class AbsenceCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
    }

    render() {
        const { class_students, students, student_absent, student_unmarked } = this.props
        // console.log('this.props.medication_requests: ', this.props.medication_requests)
        return (
            <Card style={{ flex: 1, width: '90%'}}>
                <View style={{ height: 80, justifyContent: 'center', marginTop: 5 }}>
                    <Text style={{ fontSize: 30, alignSelf: 'center', position: 'absolute' }}>出席狀況</Text>
                </View>
                <View style={{ }}>
                    <ScrollView horizontal={true}>
                        {[...student_unmarked].map((student_id) => {
                            const student = class_students[student_id]
                            if (student === undefined) return
                            return (
                                <TouchableHighlight
                                    key={student_id}
                                    style={{ flex: 1, margin: 3 }}
                                    onPress={() => {
                                        this.props.showLoginNumberPad(student_id)
                                    }}
                                >
                                    <Card style={{ flex:1, alignItems: 'center', paddingHorizontal: 15, padding: 10, backgroundColor: '#fff1b5' }}>
                                        <View style={{ justifyContent: 'center' }}>
                                            <Image
                                                source={
                                                    student.profile_picture === '' || student.profile_picture === null ?
                                                        require('../../assets/icon-thumbnail.png')
                                                        : {uri: student.profile_picture} 
                                                }
                                                style={styles.thumbnailImage}/>
                                        </View>
                                        <View
                                            style={{ justifyContent: 'center' }}
                                        >
                                            <Text style={{ fontSize: 25 }}>{student.name}</Text>
                                        </View>
                                    </Card>
                                </TouchableHighlight>
                            )
                        })}

                        {[...student_absent].map((student_id) => {
                            const student = class_students[student_id]
                            if (student === undefined) return
                            return (
                                <TouchableHighlight
                                    key={student_id}
                                    style={{ flex: 1, margin: 3 }}
                                    onPress={() => {
                                        this.props.showLoginNumberPad(student_id)
                                    }}
                                >
                                    <Card style={{ flex:1, alignItems: 'center', paddingHorizontal: 15, padding: 10, backgroundColor: '#ffe1d0' }}>
                                        <View style={{ justifyContent: 'center' }}>
                                            <Image
                                                source={
                                                    student.profile_picture === '' ?
                                                        require('../../assets/icon-thumbnail.png')
                                                        : {uri: student.profile_picture} 
                                                }
                                                style={styles.thumbnailImage}/>
                                        </View>
                                        <View
                                            style={{ justifyContent: 'center' }}
                                        >
                                            <Text style={{ fontSize: 25 }}>{student.name}</Text>
                                        </View>
                                    </Card>
                                </TouchableHighlight>
                            )
                        })}
                    </ScrollView>
                </View>
            </Card>
        )
    }
}

const styles = StyleSheet.create({
    card: {
        width: '90%',
        flex: 1
    },
    button: {
        width: '30%',
        backgroundColor:"#b5e9e9"
    },
    button_text: {
        width: '100%',
        textAlign: 'center',
        color: 'gray',
        fontSize: 30,
    },
    thumbnailImage: {
        height: 150,
        width: 150,
        borderRadius: 75
    }
})

const mapStateToProps = (state) => {
    return {
        attendance: state.school.attendance,
        students: state.school.students,
        student_absent: state.school.student_absent,
        student_unmarked: state.school.student_unmarked
    }
}

export default connect(mapStateToProps, null) (AbsenceCard)