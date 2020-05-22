import React from 'react'
import { 
    View, 
    Text,
    Platform,
    StyleSheet,
    TouchableHighlight,
    TextInput,
    Dimensions } from 'react-native'
import { formatDate, beautifyMonthDate } from '../util'
import PickerComponent from '../picker'
import TimeModal from './timemodal'
import ENV from '../../variables'
import { connect } from 'react-redux'

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

class AbsenceExcuse extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            max_date: (new Date()).setDate((new Date()).getDate() + 30),
            cached_date: null,
            startDate: new Date(),
            endDate: new Date(),
            show_start_date_picker: false,
            show_end_date_picker: false,
            showSelect: false,
            childIsSick: 0,
            excuse_type: 'none-medical',
            editing_other_option: false,
            days: ['天', '一', '二', '三', '四', '五', '六'],
            months: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
            access_mode: 'create',
            note: ''
        }
        this.setStartDate = this.setStartDate.bind(this)
        this.setEndDate = this.setEndDate.bind(this)
        this.setChildNotSick = this.setChildNotSick.bind(this)
        this.setChildSick = this.setChildSick.bind(this)
        this.onValueChange = this.onValueChange.bind(this)
        this.sendAbsenceNote = this.sendAbsenceNote.bind(this)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.request !== this.props.request) {
            const { request } = this.props
            if (!request) {
                this.setState({
                    startDate: new Date(),
                    endDate: new Date(),
                    childIsSick: 0,
                    excuse_type: 'none-medical',
                    note: '',
                    access_mode: 'create',
                    cached_date: null
                })
                return
            }
            const { date, excuse_type, note } = request
            this.setState({
                startDate: date,
                endDate: null,
                childIsSick: excuse_type === 'none-medical' ? 0 : 1,
                excuse_type,
                note,
                access_mode: 'read',
                cached_date: null
            })
        }
    }

    isIOS() {
        return Platform.OS === 'ios'
    }

    fetchAccessMode() {
        return this.state.access_mode
    }

    showSelect() {
        this.setState({ childIsSick: 1, showSelect: true })
    }

    setChildSick () {
        this.setState({ childIsSick: 1 })
    }
    
    setChildNotSick () {
        this.setState({ childIsSick: 0, excuse_type: 'none-medical' })
    }

    handleSelectStatus = (excuse_type) => {
        if (excuse_type === 'Cancel') {
            this.setState({
                showSelect: false
            })
        } else if (excuse_type === '其他') {
            this.setState({
                editing_other_option: true,
                excuse_type: '其他',
                showSelect: false
            })
        } else {
            this.setState({
                excuse_type,
                showSelect: false
            })
        }
    }

    editorOnBlur() {
        const { excuse_type } = this.state
        this.setState({
            editing_other_option: false,
            childIsSick: excuse_type === '' ? 0 : 1,
            excuse_type: excuse_type === '' ? 'none-medical' : excuse_type
        })
    }

    setStartDate(date) {
        if (Platform.OS === 'ios') {
            this.iosSetStartDate(date)
        } else { //android
            this.androidSetStartDate(date)
        }
    }

    iosSetStartDate(date) {
        const { endDate } = this.state
        if (this.state.access_mode === 'edit') {
            const { cached_date, startDate } = this.state
            this.setState({
                cached_date: cached_date === null ? startDate : cached_date,
                startDate: date
            })
        } else {
            this.setState({
                startDate: date,
                endDate: date < endDate ? endDate : date
            })
        }
    }

    androidSetStartDate(date) {
        if (date !== undefined) {
            const { endDate } = this.state
            if (this.state.access_mode === 'edit') {
                const { cached_date, startDate } = this.state
                const { id } = this.props.request
                this.setState({
                    cached_date: cached_date === null ? startDate : cached_date,
                    startDate: date,
                    show_start_date_picker: false
                })
                this.props.checkUniqueStudentDate(id, date)
            } else { // create
                this.setState({
                    startDate: date,
                    endDate: date < endDate ? endDate : date,
                    show_start_date_picker: false
                })
            }
        } else {
            this.setState({ show_start_date_picker: false })
        }
    }

    onEndEditingStartDate() {
        const {startDate } = this.state
        if (this.state.access_mode === 'edit') {
            const { id } = this.props.request
            this.props.checkUniqueStudentDate(id, startDate)
        }

        this.setState({ show_start_date_picker: false })
    }

    duplicateDateFound() {
        const { cached_date } = this.state
        this.setState({
            startDate: cached_date,
            cached_date: null
        })
    }

    setEndDate(date) {
        if (Platform.OS === 'ios') {
            this.iosSetEndDate(date)
        } else { //android
            this.androidSetEndDate(date)
        }
    }

    iosSetEndDate (date) {
        const { startDate } = this.state
        this.setState({
            startDate: date < startDate ? date : startDate,
            endDate: date
        })
    }

    androidSetEndDate(date) {
        if (date !== undefined) {
            const { startDate } = this.state
            this.setState({
                startDate: date < startDate ? date : startDate,
                endDate: date,
                show_end_date_picker: false
            })
        } else {
            this.setState({ show_end_date_picker: false })
        }
    }

    getDayDifference() {
        const { startDate, endDate } = this.state
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((endDate - startDate) / (oneDay))) + 1
    }

    onValueChange (value) {
        this.setState({ excuse_type: value })
    }

    handleClickConfirmButton() {
        const { access_mode } = this.state
        if (access_mode === 'read') {
            this.setState({
                access_mode: 'edit'
            })
        } else if (access_mode === 'create') {
            this.sendAbsenceNote()
        } else if (access_mode === 'edit') {
            const { id } = this.props.request
            this.editAbsenceNote(id)
        }
    }

    sendAbsenceNote() {
        const { excuse_type, note } = this.state
        const { student_id, class_id, school_id, isConnected } = this.props
        const startDate = formatDate(this.state.startDate)
        const endDate = formatDate(this.state.endDate)
        const request_body = {
            student_id,
            class_id,
            school_id,
            startDate,
            endDate,
            excuse_type,
            note
        }

        if (!isConnected) {
            alert('網路連不到! 請稍後再試試看')
            return
        }

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
                this.props.onCreateRequestSuccess(data.id)
            })
            .catch(err => {
                alert('Sorry 電腦出狀況了！ 請截圖和與工程師聯繫: error occurred when sending absence request')
            })
    }

    editAbsenceNote(request_id) {
        const { excuse_type, note } = this.state
        const { class_id } = this.props
        const date = formatDate(this.state.startDate)
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
                class_id
            })
        })
            .then((res) => res.json())
            .then((resJson) => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫' + message)
                    return
                }
                this.props.onCreateRequestSuccess(request_id)
            })
            .catch(err => {
                alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when editing absence request')
            })
    }

    deleteRequestConfirm() {
        const confirmed = confirm('確定要刪除？')
        if (confirmed) {
            this.deleteRequest()
        }
    }

    deleteRequest() {
        const { id } = this.props.request
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
                this.props.onDeleteRequestSuccess(id)
            })
            .catch(err => {
                alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when deleting absence request')
            })
    }

    render() {
        const {
            max_date,
            access_mode,
            startDate,
            endDate,
            excuse_type,
            editing_other_option,
            note,
            show_start_date_picker,
            show_end_date_picker,
            showSelect } = this.state
        if (show_start_date_picker) {
            return (
                <View style={{ marginVertical: 100, height: '100%' }}>
                    <TimeModal
                        start_date={startDate}
                        datetime_type={'date'}
                        hideModal={() => this.setState({ show_start_date_picker: false })}
                        selectDatetimeConfirm={(date) => this.setStartDate(date)}
                        minDatetime={new Date()}
                        maxDatetime={max_date}
                    />
                </View>
            )
        }
        if (show_end_date_picker) {
            return (
                <View style={{ marginVertical: 100, height: '100%' }}>
                    <TimeModal
                        start_date={endDate}
                        datetime_type={'date'}
                        hideModal={() => this.setState({ show_end_date_picker: false })}
                        selectDatetimeConfirm={(date) => this.setEndDate(date)}
                        minDatetime={new Date()}
                        maxDatetime={max_date}
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
                            <TouchableHighlight
                                key={index}
                                style={{ width: '50%', padding: 15, backgroundColor: 'white', borderWidth: 1, borderColor: 'lightgrey' }}
                                onPress={() => this.handleSelectStatus(value)}
                            >
                                <Text style={{ fontSize: 25 }}>{label}</Text>
                            </TouchableHighlight>
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
                            <TouchableHighlight
                                disabled={access_mode === 'read'}
                                style={{
                                    flex: 1,
                                    padding: 15,
                                    // height: '90%',
                                    justifyContent: 'center',
                                    backgroundColor: this.state.childIsSick === 0 ? '#368cbf' : 'rgba(0,0,0,0.1)',
                                    borderTopLeftRadius: 30,
                                    borderBottomLeftRadius: 30
                                }}
                                underlayColor='#368cbf'
                                onPress={this.setChildNotSick}>
                                <Text style={{ fontSize: 25, color: this.state.childIsSick === 0 ? 'white' : 'black', textAlign: 'center' }}>事假</Text>
                            </TouchableHighlight>

                            {editing_other_option ? 
                                <View
                                    style={{
                                        flex: 1,
                                        padding: 15,
                                        // height: '90%',
                                        borderTopRightRadius: 30,
                                        borderBottomRightRadius: 30,
                                        justifyContent: 'center',
                                        backgroundColor: this.state.childIsSick ? '#368cbf' : 'rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <TextInput 
                                        autoFocus={true}
                                        selectTextOnFocus={true}
                                        style={{ fontSize: 25, color: this.state.childIsSick ? 'white' : 'black', textAlign: 'center', paddingVertical: -1 }}
                                        value={excuse_type}
                                        onChangeText={excuse_type => this.setState({ excuse_type })}
                                        onBlur={() => this.editorOnBlur()}
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
                                        backgroundColor: this.state.childIsSick === 0 ? 'rgba(0,0,0,0.1)' : '#368cbf'
                                    }}
                                    disabled={access_mode === 'read'}
                                    textStyle={{ fontSize: 25, color: this.state.childIsSick ? 'white' : 'black', textAlign: 'center' }}
                                    selectedValue={excuse_type === 'none-medical' ? '病假' : excuse_type}
                                    showSelect={() => this.showSelect()}
                                    // options={[
                                    //     "感冒",
                                    //     "流感",
                                    //     "腸病毒",
                                    //     "水痘",
                                    //     "腸胃炎",
                                    //     "其他",
                                    //     "Cancel"
                                    // ]}
                                    handleOnClick={this.setChildSick}
                                    handleSelectValue={(excuse_type) => this.handleSelectStatus(excuse_type)}
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
                                    <TouchableHighlight
                                        disabled={access_mode === 'read'}
                                        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                                        onPress={() => this.setState({ show_start_date_picker: true })}
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
                                                    星期{this.state.days[startDate.getDay()]}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableHighlight>
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
                                        <TouchableHighlight
                                            style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 15 }}
                                            onPress={() => this.setState({ show_start_date_picker: true })}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ color: 'white', fontSize: width*0.09, fontWeight: 'bold' }}>
                                                    {beautifyMonthDate(startDate)}
                                                </Text>
                                                <Text style={{ fontSize: width*0.09, color: 'white', fontWeight: 'bold' }}>
                                                    星期{this.state.days[startDate.getDay()]}
                                                </Text>
                                            </View>
                                        </TouchableHighlight>
                                    </View>

                                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                                        <Text style={{ fontSize: 20 }}>
                                            總計 {this.getDayDifference()} 天
                                        </Text>
                                    </View>

                                    <View style={{width: '100%' }}>
                                        <TouchableHighlight
                                            style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 15 }}
                                            onPress={() => this.setState({ show_end_date_picker: true })}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ color: 'white', fontSize: width*0.09, fontWeight: 'bold' }}>
                                                    {beautifyMonthDate(endDate)}
                                                </Text>
                                                <Text style={{ fontSize: width*0.09, color: 'white', fontWeight: 'bold' }}>
                                                    星期{this.state.days[endDate.getDay()]}
                                                </Text>
                                            </View>
                                        </TouchableHighlight>
                                        <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: width*0.1, textAlign: 'right' }}>結束</Text>
                                    </View>
                                </View>
                            }

                            {/* NOTE */}
                            <View
                                style={{ flex: 1,width: '100%', alignItems: 'center' }}
                            >
                                <TextInput
                                    editable={access_mode !== 'read'}
                                    placeholder='備註'
                                    placeholderTextColor='grey'
                                    multiline
                                    // textAlignVertical='center'
                                    scrollEnabled={false}
                                    blurOnSubmit={true}
                                    value={note}
                                    style={{
                                        width: '100%',
                                        // height: '100%',
                                        backgroundColor: '#eaf8f8',
                                        borderRadius: 3,
                                        fontSize: 20,
                                        paddingTop: 20,
                                        paddingBottom: 20,
                                        paddingHorizontal: 20,
                                        textAlignVertical: 'center'
                                    }}
                                    onChangeText={note => this.setState({ note })}
                                />
                            </View>
                            
                            <View
                                style={{
                                    marginVertical: 30,
                                    width: '100%',
                                    flexDirection: 'row',
                                    // padding: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {access_mode !== 'edit' ?
                                    <TouchableHighlight
                                        style={{
                                            // height: '80%',
                                            width: '100%',
                                            padding: 20,
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.1)'
                                        }}
                                        onPress={() => this.handleClickConfirmButton()}
                                    >
                                        <Text style={{ fontSize: 25, textAlign: 'center' }}>
                                            {access_mode === 'read' ?
                                                '編輯'
                                                : access_mode === 'create' ?
                                                    '新增'
                                                    : null
                                            }
                                        </Text>
                                    </TouchableHighlight>
                                    : access_mode === 'edit' ?
                                        <View style={{ width: '100%', flex: 1, flexDirection: 'row' }}>
                                            <TouchableHighlight
                                                style={{
                                                    // height: '80%',
                                                    flex: 1,
                                                    paddingVertical: 20,
                                                    paddingHorizontal: 10,
                                                    justifyContent: 'center',
                                                    backgroundColor: '#fa625f'
                                                }}
                                                onPress={() => this.deleteRequestConfirm()}
                                            >
                                                <Text style={{ fontSize: 25, textAlign: 'center' }}>刪除</Text>
                                            </TouchableHighlight>

                                            <TouchableHighlight
                                                style={{
                                                    // height: '80%',
                                                    flex: 1,
                                                    paddingVertical: 20,
                                                    paddingHorizontal: 10,
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                                }}
                                                onPress={() => this.setState({ access_mode: 'read'})}
                                            >
                                                <Text style={{ fontSize: 20, textAlign: 'center' }}>取消編輯</Text>
                                            </TouchableHighlight>

                                            <TouchableHighlight
                                                style={{
                                                    // height: '80%',
                                                    flex: 1,
                                                    paddingVertical: 20,
                                                    paddingHorizontal: 10,
                                                    justifyContent: 'center',
                                                    backgroundColor: '#00c07f'
                                                }}
                                                onPress={() => this.handleClickConfirmButton()}
                                            >
                                                <Text style={{ fontSize: 25, textAlign: 'center' }}>送出</Text>
                                            </TouchableHighlight>
                                        </View>
                                        : null
                                }
                            </View>
                        </View>
                    </View>
        )
    }
}

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

export default connect(mapStateToProps, null, null, { forwardRef: true }) (AbsenceExcuse)