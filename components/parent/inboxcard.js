import React from 'react'
import { Text, TouchableHighlight  } from 'react-native'
import { Card, CardItem } from 'native-base'
import Reloading from '../reloading'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchMessagesByConversationId } from '../util'
import { setMessageDataParent} from '../../redux/parent/actions/index'

class InboxCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            messageData: {}
        }
    }

    componentDidMount() {
        this.fetchPreviewMessage(this.props.child_id)
    }

    componentDidUpdate(prevProps) {
        if (this.props.child_id !== prevProps.child_id) {
            this.setState({ isLoading: true })
            this.fetchPreviewMessage(this.props.child_id);
        }
    }

    fetchPreviewMessage(student_id) {
        // only fetching most-recent message as preview
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/message/student/${student_id}`
        fetch(query, {
            method: 'GET',
            headers: {
                Accept: 'applicaiton/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                console.log('parent/inbox/fetchData/resJson: ', resJson)
                if (resJson.statusCode === 200) {
                    this.setState({
                        messageData: resJson.data,
                        isLoading: false
                    })
                }
            })
            .catch(err => console.log('err: ', err))
    }

    async fetchMessageData() {
        const { current_conversation_id, child_id } = this.props
        const recipient_id = this.props.child_data.class_id
        this.fetchPreviewMessage(child_id)
        if (current_conversation_id === '') return
        const fetchMessageDataResult = await fetchMessagesByConversationId(current_conversation_id, child_id, recipient_id)
        if (fetchMessageDataResult.success) {
            const {messages, most_recently_read_message_id} = fetchMessageDataResult.data
            this.props.setMessageDataParent(messages, most_recently_read_message_id, current_conversation_id)
        } else {
            const err = fetchMessageDataResult.data
        }
    }

    render() {
        const { isLoading, messageData } = this.state
        return (
            <Card style={{ width: '93%', height: 130 }}>
                <CardItem>
                    <Text>訊息</Text>
                </CardItem>
                {isLoading ? 
                    <Reloading /> 
                    : messageData.new_message ? // TODO: if it's a new message, flag and make it more noticible
                        <CardItem style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={{ flex: 4 }}>{messageData.message_text}</Text>
                            <TouchableHighlight
                                style={{ flex: 1, backgroundColor: 'lightblue', height: '70%' }}
                                onPress={() => {
                                    this.props.navigation.push('ConversationPage', {
                                        conversation_id: messageData.conversation_id,
                                        sender_id: this.props.child_id,
                                        recipient_id: this.props.child_data.class_id
                                    })
                                }}
                            >
                                <Text>查看</Text>
                            </TouchableHighlight>
                        </CardItem>
                    :   <CardItem style={{ flex: 1, flexDirection: 'row'}}>
                            <Text style={{ flex: 4 }}>無新訊息</Text>
                            <TouchableHighlight
                                style={{ flex: 1, backgroundColor: 'lightblue', height: '70%', justifyContent: 'center' }}
                                onPress={() => {
                                    this.props.navigation.push('ConversationPage', {
                                        type: 'parent',
                                        conversation_id: messageData.conversation_id,
                                        sender_id: this.props.child_id,
                                        recipient_id: this.props.child_data.class_id
                                    })
                                }}
                            >
                                <Text>查看</Text>
                            </TouchableHighlight>
                    </CardItem>
                }
            </Card>
        )
    }
}

mapStateToProps = (state) => {
    return {
        current_conversation_id: state.inbox.current_conversation_id
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({setMessageDataParent}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (InboxCard)