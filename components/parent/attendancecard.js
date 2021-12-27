import React, { useState, useEffect } from 'react'
import { Card } from 'native-base'
import { View, Image, Text, } from 'react-native'
import Reloading from '../reloading'
import { formatDate, get } from '../util'

const AttendanceCard = (props) => {
    const { student_id } = props
    const [ isLoading, setIsLoading ] = useState(true)
    const [ inTime, setInTime ] = useState(null)
    const [ outTime, setOutTime ] = useState(null)
    const [ excuseType, setExcuseType ] = useState(null)
    const [ absenceTime, setAbsenceTime ] = useState(null)
    const time = {
        'morning': '早上',
        'evening': '下午',
        'all_day': '全天'
    }
    
    useEffect(() => {
        const { date } = props
        fetchAttendanceByStudentId(date)
    }, [props.date, props.student_id])

    const fetchAttendanceByStudentId = async(date) => {
        const response = await get(`/attendance/${student_id}?date=${formatDate((date))}`)
        const { success, statusCode, message, data } = response
        if (success) {
            // console.log('response: ', response)
            let { in_time, out_time, excuse_type, absence_time } = data
            if (excuse_type === 'none-medical') {
                excuse_type = '事假'
            }
            setInTime(in_time)
            setOutTime(out_time)
            setExcuseType(excuse_type)
            setAbsenceTime(absence_time)
            setIsLoading(false)
        } else if (statusCode === 400) {
            setInTime(null)
            setOutTime(null)
            setExcuseType(null)
            setAbsenceTime(null)
            setIsLoading(false)
        }
    }

    return (
        <Card style={{ width: '93%' }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ width: 56, height: 56, justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('../../assets/icon-attendance.png')}
                        style={{
                            width: 48,
                            height: 48
                        }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ paddingTop: 8 }}>
                        <Text style={{ fontSize: 20 }}>出勤</Text>
                    </View>
                    {isLoading ? 
                        <Reloading />
                        : inTime !== null || outTime !== null || excuseType !== null ? 
                            <View style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}>
                                {excuseType !== null && 
                                    <View style={{ flex: 1, paddingBottom: 8 }}>
                                        <Text style={{ fontSize: 25 }}>
                                            {`請假: ${excuseType} (${time[absenceTime]})`}
                                        </Text>
                                    </View>
                                }
                                <View style={{ flex: 1, width: '100%', flexDirection: 'row' }}>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text>到校</Text>
                                        {inTime !== null && <Text style={{ fontSize: 25, alignSelf: 'center' }}>{inTime}</Text>}
                                    </View>
                                    {/* <Text style={{ fontSize: 25 }}> ~ </Text> */}
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text>離校</Text>
                                        {outTime !== null && <Text style={{ fontSize: 25, alignSelf: 'center' }}>{outTime}</Text>}
                                    </View>
                                </View>
                            </View>
                            : 
                                <View style={{ flex: 1, paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 17 }}>沒有新紀錄</Text>
                                </View>
                    }
                </View>
            </View>
        </Card>
    )
}

export default AttendanceCard