import React, { forwardRef, useState, useImperativeHandle, useEffect } from 'react'
import { 
    View, 
    Text,
    Platform,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions } from 'react-native'
import { formatDate, beautifyMonthDate } from '../util'
import PickerComponent from '../picker'
import Modal from '../modal'
import TimeModal from './timemodal'
import ENV from '../../variables'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const { width, height } = Dimensions.get('window')

const options = [
    { value: "感冒", label: "感冒" },
    { value: '流感', label: '流感' },
    { value: '腸病毒', label: '腸病毒' },
    { value: '水痘', label: '水痘' },
    { value: '腸胃炎', label: '腸胃炎' },
    { value: '其他', label: '其他' },
    { value: 'Cancel', label: '返回' }
]

const AbsenceExcuse = forwardRef((props, ref) => {
    const navigate = useNavigate()

    const [state, setState] = useState({
        max_date: (new Date()).setDate((new Date()).getDate() + 30),
        cached_date: null,
        startDate: new Date(),
        endDate: new Date(),
        childIsSick: 0,
        excuse_type: 'none-medical',
        editing_other_option: false,
        days: ['天', '一', '二', '三', '四', '五', '六'],
        months: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
        access_mode: 'create',
        note: '',
        absence_time: 'all_day',
        scrollHeight: '100%',
        request_id: ''
            
    })

    const [showStartDatePicker, setShowStartDatePicker] = useState(false)
    const [showEndDatePicker, setShowEndDatePicker] = useState(false)
    const [showSelect, setShowSelect] = useState(false)

    useImperativeHandle(ref, () => ({
        fetchAccessMode() {
            return state.access_mode
        },
        duplicateDateFound() {
            const { cached_date } = state
            setState({
                ...state,
                startDate: cached_date,
                cached_date: null
            })
        }
    }))

    useEffect(() => {
        const { request } = props
        if (!request) {
            setState({
                ...state,
                startDate: new Date(),
                endDate: new Date(),
                childIsSick: 0,
                excuse_type: 'none-medical',
                note: '',
                absence_time: 'all_day',
                access_mode: 'create',
                cached_date: null,
                scrollHeight: '100%',
                request_id: ''
            })
            return
        }
        const { id, date, excuse_type, note, absence_time } = request
        setState({
            ...state,
            startDate: date,
            endDate: null,
            childIsSick: excuse_type === 'none-medical' ? 0 : 1,
            excuse_type,
            note,
            absence_time,
            access_mode: 'read',
            cached_date: null,
            request_id: id
        })
    }, [props.request])

    const isIOS = () => {
        return Platform.OS === 'ios'
    }

    const showSelectOption = () => {
        setState({ ...state, childIsSick: 1 })
        setShowSelect(true)
    }

    const setChildSick = () => {
        setState({ ...state, childIsSick: 1 })
    }
    
    const setChildNotSick = () => {
        const { access_mode } = state
        if (access_mode === 'read') return
        setState({ ...state, childIsSick: 0, excuse_type: 'none-medical' })
    }

    const handleSelectStatus = (excuse_type) => {
        if (excuse_type === 'Cancel') {
            setShowSelect(false)
        } else if (excuse_type === '其他') {
            setState({
                ...state,
                editing_other_option: true,
                excuse_type: '其他'
            })
            setShowSelect(false)
        } else {
            setState({
                ...state,
                excuse_type
            })
            setShowSelect(false)
        }
    }

    const editorOnBlur = () => {
        const { excuse_type } = state
        setState({
            ...state,
            editing_other_option: false,
            childIsSick: excuse_type === '' ? 0 : 1,
            excuse_type: excuse_type === '' ? 'none-medical' : excuse_type
        })
    }

    const setStartDate = (date) => {
        if (Platform.OS === 'ios') {
            iosSetStartDate(date)
        } else { //android
            androidSetStartDate(date)
        }
    }

    const iosSetStartDate = (date) => {
        const { endDate } = state
        if (state.access_mode === 'edit') {
            const { cached_date, startDate } = state
            setState({
                ...state,
                cached_date: cached_date === null ? startDate : cached_date,
                startDate: date
            })
        } else {
            setState({
                ...state,
                startDate: date,
                endDate: date < endDate ? endDate : date
            })
        }
    }

    const androidSetStartDate = (date) => {
        if (date !== undefined) {
            const { endDate } = state
            if (state.access_mode === 'edit') {
                const { cached_date, startDate } = state
                const { id } = props.request
                setState({
                    ...state,
                    cached_date: cached_date === null ? startDate : cached_date,
                    startDate: date
                })
                setShowStartDatePicker(false)
                props.checkUniqueStudentDate(id, date)
            } else { // create
                setState({
                    ...state,
                    startDate: date,
                    endDate: date < endDate ? endDate : date
                })
                setShowStartDatePicker(false)
            }
        } else {
            setShowStartDatePicker(false)
        }
    }

    const onEndEditingStartDate = () => {
        const {startDate } = state
        if (state.access_mode === 'edit') {
            const { id } = props.request
            props.checkUniqueStudentDate(id, startDate)
        }
        setShowStartDatePicker
    }

    const setEndDate = (date) => {
        if (Platform.OS === 'ios') {
            iosSetEndDate(date)
        } else { //android
            androidSetEndDate(date)
        }
    }

    const iosSetEndDate = (date) => {
        const { startDate } = state
        setState({
            ...state,
            startDate: date < startDate ? date : startDate,
            endDate: date
        })
    }

    const androidSetEndDate = (date) => {
        if (date !== undefined) {
            const { startDate } = state
            setState({
                ...state,
                startDate: date < startDate ? date : startDate,
                endDate: date
            })
        } else {
            setShowEndDatePicker(false)
        }
    }

    const getDayDifference = () => {
        const { startDate, endDate } = state
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((endDate - startDate) / (oneDay))) + 1
    }

    const onValueChange = (value) => {
        setState({ ...state, excuse_type: value })
    }

    const setScrollHeight = (scrollHeight) => {
        setState({ ...state, scrollHeight })
    }

    const handleClickConfirmButton = () => {
        const { access_mode } = state
        if (access_mode === 'read') {
            setState({
                ...state,
                access_mode: 'edit'
            })
        } else if (access_mode === 'create') {
            sendAbsenceNote()
        } else if (access_mode === 'edit') {
            const { id } = props.request
            editAbsenceNote(id)
        }
    }

    const sendAbsenceNote = () => {
        const { excuse_type, note, absence_time } = state
        const { student_id, class_id, school_id, isConnected } = props
        const startDate = formatDate(state.startDate)
        const endDate = formatDate(state.endDate)
        const request_body = {
            student_id,
            class_id,
            school_id,
            startDate,
            endDate,
            excuse_type,
            note,
            absence_time
        }

        // if (!isConnected) {
        //     alert('網路連不到! 請稍後再試試看')
        //     return
        // }

        fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/absence-excuse`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        })
            .then((res) => res.json())
            .then((resJson) => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    alert('Sorry 電腦出狀況了！ 請截圖和與工程師聯繫' + message)
                    return
                }
                props.onCreateRequestSuccess(data.id)
                navigate(-1)
            })
            .catch(err => {
                alert('Sorry 電腦出狀況了！ 請截圖和與工程師聯繫: error occurred when sending absence request')
            })
    }

    const editAbsenceNote = (request_id) => {
        const { excuse_type, note, absence_time } = state
        const { class_id } = props
        const date = formatDate(state.startDate)
        fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/absence-excuse`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request_id,
                excuse_type,
                note,
                date,
                class_id,
                absence_time
            })
        })
            .then((res) => res.json())
            .then((resJson) => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫' + message)
                    return
                }
                props.onCreateRequestSuccess(request_id)
                navigate(-1)
            })
            .catch(err => {
                alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when editing absence request')
            })
    }

    const deleteRequestConfirm = () => {
        const confirmed = confirm('確定要刪除？')
        if (confirmed) {
            deleteRequest()
        }
    }

    const deleteRequest = () => {
        const { id } = props.request
        fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/absence-excuse`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request_id: id
            })
        })
            .then((res) => res.json())
            .then((resJson) => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫' + message)
                    return
                }
                props.onDeleteRequestSuccess(id)
                navigate(-1)
            })
            .catch(err => {
                alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when deleting absence request')
            })
    }

        const {
            max_date,
            access_mode,
            startDate,
            endDate,
            excuse_type,
            editing_other_option,
            note,
            absence_time,
            scrollHeight,
            request_id } = state
        if (showStartDatePicker) {
            return (
                <View style={{ height, marginTop: -120 }}>
                    <TimeModal
                        start_date={startDate}
                        datetime_type={'date'}
                        hideModal={() => setShowStartDatePicker(false)}
                        selectDatetimeConfirm={(date) => setStartDate(date)}
                        minDatetime={new Date()}
                        maxDatetime={max_date}
                        paddingVertical={100}
                    />
                </View>
            )
        }
        if (showEndDatePicker) {
            return (
                <View style={{ height, marginTop: -120 }}>
                    <TimeModal
                        start_date={endDate}
                        datetime_type={'date'}
                        hideModal={() => setShowEndDatePicker(false)}
                        selectDatetimeConfirm={(date) => setEndDate(date)}
                        minDatetime={new Date()}
                        maxDatetime={max_date}
                        paddingVertical={100}
                    />
                </View>
            )
        }
        if (showSelect) {
            return (
                <View style={{ padding: 30, height: '100%', alignItems: 'center' }}>
                    {options.map((option, index) => {
                        const { label, value } = option
                        return (
                            <TouchableOpacity
                                key={index}
                                style={{ width: '50%', padding: 15, backgroundColor: 'white', borderWidth: 1, borderColor: 'lightgrey' }}
                                onPress={() => handleSelectStatus(value)}
                            >
                                <Text style={{ fontSize: 25 }}>{label}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            )
        }
        return (
                    <View style={{ paddingHorizontal: 30, paddingVertical: 30, height: '100%' }}>

                        <View
                            style={{
                                // flex: 1,
                                flexDirection: 'row',
                                // justifyContent: 'space-evenly',
                                // alignItems: 'center',
                            }}
                        >
                            <TouchableOpacity
                                disabled={access_mode === 'read'}
                                style={{
                                    flex: 1,
                                    padding: 15,
                                    // height: '90%',
                                    justifyContent: 'center',
                                    backgroundColor: state.childIsSick === 0 ? '#368cbf' : 'rgba(0,0,0,0.1)',
                                    borderTopLeftRadius: 30,
                                    borderBottomLeftRadius: 30
                                }}
                                underlayColor='#368cbf'
                                onPress={() => setChildNotSick()}>
                                <Text style={{ fontSize: 25, color: state.childIsSick === 0 ? 'white' : 'black', textAlign: 'center' }}>事假</Text>
                            </TouchableOpacity>

                            {editing_other_option ? 
                                <View
                                    style={{
                                        flex: 1,
                                        padding: 15,
                                        // height: '90%',
                                        borderTopRightRadius: 30,
                                        borderBottomRightRadius: 30,
                                        justifyContent: 'center',
                                        backgroundColor: state.childIsSick ? '#368cbf' : 'rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <TextInput 
                                        autoFocus={true}
                                        selectTextOnFocus={true}
                                        style={{ fontSize: 25, color: state.childIsSick ? 'white' : 'black', textAlign: 'center', paddingVertical: -1 }}
                                        value={excuse_type}
                                        onChangeText={excuse_type => setState({ ...state, excuse_type })}
                                        onBlur={() => editorOnBlur()}
                                    />
                                </View>
                                :
                                <PickerComponent
                                    style={{
                                        flex: 1,
                                        padding: 15,
                                        // height: '90%',
                                        borderTopRightRadius: 30,
                                        borderBottomRightRadius: 30,
                                        justifyContent: 'center',
                                        backgroundColor: state.childIsSick === 0 ? 'rgba(0,0,0,0.1)' : '#368cbf'
                                    }}
                                    disabled={access_mode === 'read'}
                                    textStyle={{ fontSize: 25, color: state.childIsSick ? 'white' : 'black', textAlign: 'center' }}
                                    selectedValue={excuse_type === 'none-medical' ? '病假' : excuse_type}
                                    showSelect={() => showSelectOption()}
                                    // options={[
                                    //     "感冒",
                                    //     "流感",
                                    //     "腸病毒",
                                    //     "水痘",
                                    //     "腸胃炎",
                                    //     "其他",
                                    //     "Cancel"
                                    // ]}
                                    handleOnClick={() => setChildSick()}
                                    handleSelectValue={(excuse_type) => handleSelectStatus(excuse_type)}
                                />
                            }
                        </View>
                        <View style={{ width: '100%' }}>
                            {endDate === null ?
                                <View
                                    style={{
                                        paddingVertical: 20,
                                        width: '70%',
                                        alignSelf: 'center'
                                    }}
                                >
                                    <TouchableOpacity
                                        disabled={access_mode === 'read'}
                                        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                                        onPress={() => {
                                            if (access_mode === 'read') return
                                            setShowStartDatePicker(true)
                                        }}
                                    >
                                        <View style={{ padding: 15, justifyContent: 'center' }}>
                                            <View style={{}}>
                                                <Text style={{ color: 'white', fontSize: width*0.12, fontWeight: 'bold' }}>
                                                    {startDate.getFullYear()}
                                                </Text>
                                            </View>
                                            <View style={{}}>
                                                <Text style={{ color: 'white', fontSize: width*0.12, fontWeight: 'bold' }}>
                                                    {startDate.getMonth() + 1}/{startDate.getDate()}
                                                </Text>
                                            </View>
                                            <View style={{}}>
                                                <Text style={{ fontSize: width*0.12, color: 'white', fontWeight: 'bold' }}>
                                                    星期{state.days[startDate.getDay()]}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                :
                                <View
                                    style={{
                                        // flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 15
                                    }}
                                >
                                    <View style={{ width: '100%' }}>
                                        <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: width*0.1 }}>開始</Text>
                                        <TouchableOpacity
                                            style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 15 }}
                                            onPress={() => setShowStartDatePicker(true)}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ color: 'white', fontSize: width*0.09, fontWeight: 'bold' }}>
                                                    {beautifyMonthDate(startDate)}
                                                </Text>
                                                <Text style={{ fontSize: width*0.09, color: 'white', fontWeight: 'bold' }}>
                                                    星期{state.days[startDate.getDay()]}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                                        <Text style={{ fontSize: 25 }}>
                                            總計 {getDayDifference()} 天
                                        </Text>
                                    </View>

                                    <View style={{width: '100%' }}>
                                        <TouchableOpacity
                                            style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 15 }}
                                            onPress={() => setShowEndDatePicker(true)}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ color: 'white', fontSize: width*0.09, fontWeight: 'bold' }}>
                                                    {beautifyMonthDate(endDate)}
                                                </Text>
                                                <Text style={{ fontSize: width*0.09, color: 'white', fontWeight: 'bold' }}>
                                                    星期{state.days[endDate.getDay()]}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: width*0.1, textAlign: 'right' }}>結束</Text>
                                    </View>
                                </View>
                            }

                            {/* NOTE */}
                            <View
                                style={{ flex: 1,width: '100%', alignItems: 'center' }}
                            >
                                <TextInput
                                    key={request_id}
                                    editable={access_mode !== 'read'}
                                    placeholder='備註'
                                    placeholderTextColor='grey'
                                    multiline
                                    // textAlignVertical='center'
                                    scrollEnabled={false}
                                    // blurOnSubmit={true}
                                    value={note}
                                    style={{
                                        width: '100%',
                                        height: scrollHeight,
                                        backgroundColor: '#eaf8f8',
                                        borderRadius: 3,
                                        fontSize: 25,
                                        paddingTop: 20,
                                        paddingBottom: 20,
                                        paddingHorizontal: 20,
                                        textAlignVertical: 'center'
                                    }}
                                    onChangeText={note => setState({ ...state, note })}
                                    onChange={(e) => setScrollHeight(e.target.scrollHeight)}
                                    onLayout={(event) => {
                                        const { scrollHeight } = event.nativeEvent.target
                                        setState({
                                            ...state,
                                            scrollHeight
                                        })
                                    }}
                                />
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <TouchableOpacity
                                    disabled={access_mode === 'read'}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 15,
                                        justifyContent: 'center'
                                    }}
                                    underlayColor='transparent'
                                    onPress={() => {
                                        if (access_mode === 'read') return
                                        setState({ ...state, absence_time: 'all_day' })
                                    }}
                                >
                                    <Text 
                                        style={{
                                            width: '90%',
                                            fontSize: 25,
                                            backgroundColor: absence_time === 'all_day' ? '#368cbf' : 'rgba(0,0,0,0.1)',
                                            color: absence_time === 'all_day' ? 'white' : 'black',
                                            padding: 15,
                                            textAlign: 'center'
                                        }}
                                    >
                                        全天
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    disabled={access_mode === 'read'}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                    underlayColor='transparent'
                                    onPress={() => {
                                        if (access_mode === 'read') return
                                        setState({ ...state, absence_time: 'morning' })
                                    }}
                                >
                                    <Text 
                                        style={{
                                            width: '90%',
                                            fontSize: 25,
                                            backgroundColor: absence_time === 'morning' ? '#368cbf' : 'rgba(0,0,0,0.1)',
                                            color: absence_time === 'morning' ? 'white' : 'black',
                                            padding: 15,
                                            textAlign: 'center'
                                        }}
                                    >
                                        早上
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    disabled={access_mode === 'read'}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        justifyContent: 'center',
                                        alignItems: 'flex-end'
                                    }}
                                    underlayColor='transparent'
                                    onPress={() => {
                                        if (access_mode === 'read') return
                                        setState({ ...state, absence_time: 'evening' })
                                    }}
                                >
                                    <Text 
                                        style={{
                                            width: '90%',
                                            fontSize: 25,
                                            backgroundColor: absence_time === 'evening' ? '#368cbf' : 'rgba(0,0,0,0.1)',
                                            color: absence_time === 'evening' ? 'white' : 'black',
                                            padding: 15,
                                            textAlign: 'center'
                                        }}
                                    >
                                        下午
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View
                                style={{
                                    marginVertical: 20,
                                    width: '100%',
                                    flexDirection: 'row',
                                    // padding: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {access_mode !== 'edit' ?
                                    <TouchableOpacity
                                        style={{
                                            // height: '80%',
                                            width: '100%',
                                            padding: 20,
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.1)'
                                        }}
                                        onPress={() => handleClickConfirmButton()}
                                    >
                                        <Text style={{ fontSize: 25, textAlign: 'center' }}>
                                            {access_mode === 'read' ?
                                                '編輯'
                                                : access_mode === 'create' ?
                                                    '新增'
                                                    : null
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                    : access_mode === 'edit' ?
                                        <View style={{ width: '100%', flex: 1, flexDirection: 'row' }}>
                                            <TouchableOpacity
                                                style={{
                                                    // height: '80%',
                                                    flex: 1,
                                                    paddingVertical: 20,
                                                    paddingHorizontal: 10,
                                                    justifyContent: 'center',
                                                    backgroundColor: '#fa625f'
                                                }}
                                                onPress={() => deleteRequestConfirm()}
                                            >
                                                <Text style={{ fontSize: 25, textAlign: 'center' }}>刪除</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={{
                                                    // height: '80%',
                                                    flex: 1,
                                                    paddingVertical: 20,
                                                    paddingHorizontal: 10,
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                                }}
                                                onPress={() => setState({ ...state, access_mode: 'read'})}
                                            >
                                                <Text style={{ fontSize: 20, textAlign: 'center' }}>取消編輯</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={{
                                                    // height: '80%',
                                                    flex: 1,
                                                    paddingVertical: 20,
                                                    paddingHorizontal: 10,
                                                    justifyContent: 'center',
                                                    backgroundColor: '#00c07f'
                                                }}
                                                onPress={() => handleClickConfirmButton()}
                                            >
                                                <Text style={{ fontSize: 25, textAlign: 'center' }}>送出</Text>
                                            </TouchableOpacity>
                                        </View>
                                        : null
                                }
                            </View>
                        </View>
                    </View>
        )
})

const styles = StyleSheet.create({
    dateContainer: {
        flex: 1,
        width: '35%',
        justifyContent: 'center'
    }
})

const mapStateToProps = (state) => {
    return {
        isConnected: state.parent.isConnected
    }
}

// export default connect(mapStateToProps, null) (AbsenceExcuse)
export default AbsenceExcuse