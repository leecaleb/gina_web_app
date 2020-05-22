import React from 'react'
import { Image, StyleSheet, View, Text, TouchableHighlight } from 'react-native'
import { Card } from 'native-base'
import { formatHourMinute, beautifyTime } from '../../util'
import TimeModal from '../../parent/timemodal'

export default class MedRequestModal extends React.Component {
    constructor (props) {
        super(props)
        this.state={
            medicated_time: new Date(),
            showTimePicker: false
        }
    }

    selectDatetimeConfirm(time){
        this.setState({
            medicated_time: time,
            showTimePicker: false
        })
    }

    render() {
        const { thumbnail, student_name, request } = this.props
        const { medicated_time, showTimePicker } = this.state
        const { administered, fever_entry, medication, note, student_id, teacher_id, timestamp } = request
        const { before_meal, gel, other_type, powder, powder_refrigerated, syrup } = medication
        // const { other_type, powder, powder_refrigerated, syrup, temperature } = fever_entry
        const time = formatHourMinute(new Date(timestamp))
        return (
            <Card style={{ flex: 1, alignSelf: 'center', width: '100%' }}>

                {showTimePicker ?
                    <TimeModal
                        start_date={medicated_time}
                        datetime_type={'time'}
                        hideModal={() => this.setState({ showTimePicker: false })}
                        selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
                        minDatetime={null}
                        maxDatetime={null}
                    />
                    : null
                }

                <View style={{ flex: 0.35, flexDirection: 'row' }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={thumbnail === '' ?
                                require('../../../assets/icon-thumbnail.png')
                                : { uri: thumbnail }
                            }
                            style={styles.thumbnailImage}
                        />
                    </View>
                    
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 70, fontWeight: 'bold' }}>{student_name}</Text>
                        <Text style={{ fontSize: 70, fontWeight: 'bold' }}>{time} {before_meal === null ? null : before_meal ? '餐前' : '餐後'}</Text>
                    </View>
                </View>
                <View style={{ flex: 0.65, paddingBottom: 20 }}>
                    <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
                        {powder &&
                            <View style={{ width: '48%', padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', flexDirection: 'row', marginBottom: 15, marginHorizontal: 7}}>
                                <Image
                                    source={require('../../../assets/icon-medication-powder.png')}
                                />
                                <View>
                                    <Text style={{ fontSize: 30 }}>藥粉</Text>
                                    {powder_refrigerated && <Text style={{ fontSize: 30 }}>需冷藏</Text>}
                                </View>
                            </View>
                        }
                        {syrup.length !== 0 &&
                        <View style={{ width: '48%', padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 15, flexDirection: 'row', marginHorizontal: 7 }}>
                            <Image
                                source={require('../../../assets/icon-medication-syrup.png')}
                            />
                            <View>
                                <Text style={{ fontSize: 30 }}>藥水</Text>
                                {syrup.map((entry, index) => {
                                    return (
                                        <View key={index} style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontSize: 20 }}>{entry.amount} c.c.</Text>
                                            {entry.need_refrigerated && <Text style={{ fontSize: 20, marginLeft: 20 }}>需冷藏</Text>}
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                        }
                        {gel &&
                        <View style={{ width: '48%', padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 15, flexDirection: 'row', marginHorizontal: 7 }}>
                            <Image
                                source={require('../../../assets/icon-medication-gel.png')}
                            />
                            <View>
                                <Text style={{ fontSize: 30 }}>藥膏</Text>
                                <Text style={{ fontSize: 30 }}>{gel}</Text>
                            </View>
                        </View>
                        }
                        {other_type &&
                        <View style={{ width: '48%', padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 15, flexDirection: 'row', marginHorizontal: 7 }}>
                            <Image
                                source={require('../../../assets/icon-medication-pill.png')}
                            />
                            <View>
                                <Text style={{ fontSize: 30 }}>其他</Text>
                                <Text style={{ fontSize: 30 }}>{other_type}</Text>
                            </View>
                        </View>
                        }
                    </View>
                    <View style={{ width: '97%', marginHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ width: '32%', aspectRatio: 1, backgroundColor: '#fff1b5' }}>
                            <View style={{ padding: 10 }}>
                                <Text style={{ fontSize: 30 }}>備註</Text>
                            </View>
                            <View style={{ padding: 10 }}>
                                <Text style={{ fontSize: 25 }}>{note}</Text>
                            </View>
                        </View>

                        <View style={{ width: '40%', backgroundColor: '#fa625f' }}>
                            <View style={{ padding: 10 }}>
                                <Text style={{ fontSize: 30, color: 'white' }}>發燒超過 {fever_entry.temperature}°C</Text>
                            </View>
                            <View style={{ padding: 10 }}>
                                {fever_entry.powder &&
                                    <Text style={{ fontSize: 25, color: 'white' }}>藥粉 {fever_entry.powder_refrigerated && '需冷藏'}</Text>
                                }

                                {fever_entry.syrup.length !== 0 &&
                                    <View style={{ flexDirection: 'row'}}>
                                        <Text style={{ fontSize: 25, color: 'white' }}>藥水    </Text>
                                        {fever_entry.syrup.map((entry, index) => {
                                            return (
                                                <Text key={index} style={{ fontSize: 25, color: 'white' }}>{entry.amount} c.c. {entry.need_refrigerated && '需冷藏'}</Text>
                                            )
                                        })}
                                    </View>
                                }

                                {fever_entry.other_type && 
                                    <Text style={{ fontSize: 25, color: 'white' }}>其他    {fever_entry.other_type}</Text>
                                }
                            </View>
                        </View>

                        <View style={{ width: '25%', justifyContent: 'space-between'}}>
                            <TouchableHighlight 
                                style={{ 
                                    padding: 15, 
                                    backgroundColor: 'rgba(0,0,0,0.2)', 
                                    justifyContent: 'center', 
                                    alignItems: 'center' 
                                }}
                                onPress={() => this.setState({ showTimePicker: true })}
                            >
                                <Text style={{ fontSize: 40 }}>{beautifyTime(medicated_time)}</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={{
                                    padding: 15,
                                    width: '100%',
                                    backgroundColor: administered ? '#dcf3d0' : '#ffe1d0',
                                    alignItems: 'center'
                                }}
                                onPress={() => this.props.showLoginNumberPad()}
                            >
                                <Text style={{ fontSize: 40 }}>完成</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
            </Card>
        )
    }
}

const styles = StyleSheet.create({
    thumbnailImage: {
        height: 180,
        width: 180,
        borderRadius: 90
    }
})