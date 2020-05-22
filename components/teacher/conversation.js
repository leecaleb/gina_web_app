import React from 'react'
import { View, Text, TextInput, KeyboardAvoidingView, TouchableHighlight, ScrollView } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchMessagesByConversationId } from '../util'
import { setMessageDataSchool, clearCurrentConversationIdSchool } from '../../redux/school/actions/index'
import { setMessageDataParent, clearCurrentConversationIdParent } from '../../redux/parent/actions/index'
import Reloading from '../reloading'
/*
  !!! GOAL: re-use this for both teacher side and parent side
  Have: conversation_id, recipient_id (all from props)
  TODO: subscribe to redux store for message
        -> on message status change, display status accordingly
*/

class Conversation extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      conversation_id: '',
      sender_id: '',
      recipient_id: '',
      message_text: '',
      messages: [
        // ?????
      ],
      most_recently_read_message_id: ""
    }
    this.sendMessage = this.sendMessage.bind(this)
  }

  componentDidMount() {
    const conversation_id = this.props.navigation.getParam('conversation_id', '')
    const sender_id = this.props.navigation.getParam('sender_id', '')
    const recipient_id = this.props.navigation.getParam('recipient_id', '')

    this.setState({
      conversation_id,
      sender_id,
      recipient_id
    })

    this.fetchMessages(conversation_id, sender_id, recipient_id)
  }

  async fetchMessages(conversation_id, sender_id, recipient_id) {
    const fetchMessagesResult = await fetchMessagesByConversationId(conversation_id, sender_id, recipient_id)
    if (fetchMessagesResult.success) {
      this.setMessageData(fetchMessagesResult.data, recipient_id)
      // this.markRead(fetchMessagesResult.data.messages)
    } else {
      const err = fetchMessagesResult.data
    }
  }

  setMessageData(messageData, recipient_id) {
    const { messages, most_recently_read_message_id } = messageData
    const inbox_type = this.props.navigation.getParam('type', '')
    if (inbox_type === 'parent') {
      this.props.setMessageDataParent(messages, most_recently_read_message_id, this.state.conversation_id)
    } else { // inbox_type === 'school'
      this.props.setMessageDataSchool(messages, most_recently_read_message_id, this.state.conversation_id, recipient_id)
    }
  }

  sendMessage() {
    const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/message`
    const { message_text, conversation_id, sender_id, recipient_id } = this.state
    fetch(query, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message_text,
          conversation_id,
          sender_id,
          recipient_id
        })
    })
        .then(res => res.json())
        .then(resJson => {
          console.log('inbox/sendMessage/resJson: ', resJson)
          if (resJson.statusCode === 200) {
            // on send message, we need to update inbox page to reflect most recent message for preview
            // possibly update redux locally to trick users
            this.setState({ message_text: ''})
            this.fetchMessages(conversation_id, sender_id, recipient_id)
          }
        })
        .catch(err => console.log('err: ', err))
  }

  // setReadReceipt(most_recently_read_message_id) {
  //   const inbox_type = this.props.navigation.getParam('type', '')
  //   if (inbox_type === 'parent') {
  //     this.props.setParentReadReceipt(most_recently_read_message_id)
  //   } else { // inbox_type === 'school'
  //     this.props.setSchoolReadReceipt(this.state.conversation_id, most_recently_read_message_id)
  //   }
  // }

  // markRead(message_array) {
  //   // console.log('message_array: ', message_array)
  //   const { sender_id, recipient_id } = this.state
  //   const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/message`

  //   const most_recent_message = message_array[0] ? message_array[0] : null
  //   if (most_recent_message === null || most_recent_message.sender_id === sender_id || most_recent_message.read_at !== null) {
  //     return
  //   }

  //   fetch(query, {
  //     method: 'PUT',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       most_recent_message_id: most_recent_message.message_id,
  //       recipient_id
  //     })
  //   })
  //     .then(res => res.json())
  //     .then(resJson => {
  //       console.log('markRead/resJson: ', resJson)
  //     })
  //     .catch(err => console.log('err: ', err))
    
  // }

  componentWillUnmount() {
    const user_type = this.props.navigation.getParam('type', '')
    if (user_type === 'parent') {
      this.props.clearCurrentConversationIdParent()
    } else {
      this.props.clearCurrentConversationIdSchool()
    }
  }

  render() {
    console.log('this.props.inbox: ', this.props.inbox)
    const { conversation_id, sender_id } = this.state
    const conversation = this.props.inbox.conversations_by_id[conversation_id]
    if (!conversation) {
      return (
        <Reloading />
      )
    }

    return (
      <KeyboardAvoidingView
        style={{
          flex: 1,
          paddingHorizontal: 15,
          marginBottom: 25,
          // backgroundColor: 'lightblue',
        }}
        contentContainerStyle={{
          flex: 1
        }}
        behavior='position'
        keyboardVerticalOffset={100}
        enabled
      >
        <View style={{ flex: 14 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, flexDirection: 'column-reverse' }}
            showsVerticalScrollIndicator={false}
            ref={ref => this.scrollView = ref}
            onContentSizeChange={(contentWidth, contentHeight) => {
              this.scrollView.scrollToEnd({animated: true})
            }}
          >
            {conversation.messages.map((message, index) => {
              return (
                <Text key={index} style={{ textAlign: message.sender_id == sender_id ? 'right' : 'left' }}>
                  <Text style={{ fontSize: 30 }}>{message.message_text}{'\n'}</Text>
                  {message.message_id === conversation.most_recently_read_message_id ?
                    <Text>Read</Text>
                    : null}
                  {/* <Text style={{ fontSize: 10 }}>{message.created_at}{'\n'}</Text> */}
                </Text>
              )
            })}
          </ScrollView>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white'}}>
          <TextInput
            style={{ flex: 5, borderColor: 'gray', borderWidth: 1 }}
            onChangeText={message_text => {
              this.setState({message_text})
            }}
            value={this.state.message_text}
          />
          <TouchableHighlight
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: 'lightgrey',
              borderWidth: 1,
              backgroundColor: 'lightgrey'
            }}
            onPress={this.sendMessage}
          >
            <Text>Send</Text>
          </TouchableHighlight>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    inbox: state.inbox
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({ setMessageDataSchool, setMessageDataParent, clearCurrentConversationIdParent, clearCurrentConversationIdSchool }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (Conversation)