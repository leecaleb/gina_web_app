import React from 'react'
import { StyleSheet, Image, TouchableHighlight } from 'react-native'
import { Container, Content, Text, Button, View, Card, CardItem, Body } from 'native-base'
import { connect } from 'react-redux'
import Header from '../../header'
import { bindActionCreators } from 'redux'
import {addWaterRecord} from '../../../redux/school/actions/index'
import { formatDate, formatTime } from '../../util';

class TeacherWaterLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedId: [],
            date: new Date()
        }
        this.handleOnClick = this.handleOnClick.bind(this)
        this.handleSend = this.handleSend.bind(this)
    }

    static navigationOptions = {
        headerTitle: <Header title={'Water Log Page'} />,
    }

    componentDidMount() {
    }
    
    handleOnClick(student_id) {
        const time = formatTime(new Date())
        this.props.addWaterRecord(time, student_id)
    }

    handleSend() {
        var data = {}
        const records = this.props.water.byId
        for (var student_id in records) {
            if (records[student_id].length !== 0) {
                data[student_id] = records[student_id]
            }
        }

        var request_body = {
            date: formatDate(this.state.date),
            data_objs: data
        }

        const query = 'https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/water/'
        
        fetch(query, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        })
            .then((res) => res.json())
            .then((resJson) => {
                console.log(resJson)
            })
            .catch(err => console.log(err))
    }

    render() {
        console.log(this.props.water)
        const date = this.state.date
        return (
            <Container>
                <Content contentContainerStyle={{ alignItems: 'center' }}>
                    <View style={styles.subHeading}>
                        <Text style={{ fontSize: 35 }}>{date.getFullYear() + '.' + (date.getMonth()+1) + '.' + date.getDate()}</Text>
                        <Button
                            style={{ backgroundColor: '#dcf3d0' }}
                            onPress={this.handleSend}>
                            <Text style={{ color: 'grey' }}>Send</Text>
                        </Button>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', flexDirection: 'row' }}>
                        {Object.keys(this.props.class.students).map((student_id) => {
                            return (
                                <View key={student_id} style={{ width: '98%' }}>
                                    <Card>
                                        <CardItem>
                                            <TouchableHighlight
                                                key={student_id}
                                                style={styles.childThumbnail}
                                                onPress={() => this.handleOnClick(student_id)}
                                            >
                                                <Image
                                                    source={{ uri: this.props.class.students[student_id].profile_picture }}
                                                    style={styles.thumbnailImage}/>
                                            </TouchableHighlight>  
                                            <View style={{ width: '77%'}}>
                                                <Text style={{ fontSize: 25, paddingLeft: 18 }}>{this.props.class.students[student_id].f_name}</Text>
                                                <Body>
                                                    {this.props.water.byId[student_id].map(time => {
                                                        return <Text key={time}>{time}</Text>
                                                    })}
                                                </Body>
                                            </View>
                                        </CardItem>
                                    </Card>
                                </View>
                            )
                        })}
                    </View>
                </Content>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    childThumbnail: {
        width: 100,
        height: 100,
        backgroundColor: 'transparent',
        marginLeft: -7,
        borderRadius: 50
    },
    thumbnailImage: {
        width: 100,
        height: 100,
        borderRadius: 50
    },
    subHeading: {
        width: 355,
        height: 45,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo,
        water: state.water
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({ addWaterRecord }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (TeacherWaterLog)