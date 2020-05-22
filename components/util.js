// import { connect } from "react-redux"
import ENV from '../variables'

export const formatDate = (date) => {
    return date.getFullYear() + '-' + ('0' + (date.getMonth()+ 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
}

export const beautifyDate = (date) => {
    return date.getFullYear() + '/' + ('0' + (date.getMonth()+ 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2)
}

export const beautifyMonthDate = (date) => {
    return ('0' + (date.getMonth()+ 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2)
}

export const formatTime = (date) => {
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
}

export const beautifyTime = (date) => {
    return date.getHours() + ':' + date.getMinutes()
}

export const formatHourMinute = (date) => {
    return date.getHours() + ':' + date.getMinutes()
}

export const get = async (endpoint) => {
    var success = true
    const result = await fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}${endpoint}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then(res => res.json())
            .then(resJson => {
                // console.log(resJson)
                const { statusCode, message, data } = resJson
                if (statusCode > 200) {
                    success = false
                } else if (statusCode === undefined) {
                    return {
                        success: false,
                        statusCode: 500,
                        message,
                        data: {}
                    }
                }

                return {
                    success,
                    statusCode,
                    message,
                    data
                }
            }).catch(err => {
                return {
                    success: false,
                    statusCode: 500,
                    message: err.message,
                    data: {}
                }
            })

    return result
}

export const post = async (endpoint, body) => {
    var success = true
    const result = await fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}${endpoint}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200) {
                    success = false
                } else if (statusCode === undefined) {
                    return {
                        success: false,
                        statusCode: 500,
                        message,
                        data: {}
                    }
                }

                return {
                    success,
                    statusCode,
                    message,
                    data
                }
            }).catch(err => {
                return {
                    success: false,
                    statusCode: 500,
                    message: err.message,
                    data: {}
                }
            })

    return result
}

export const put = async (endpoint, body) => {
    var success = true
    const result = await fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}${endpoint}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200) {
                    success = false
                } else if (statusCode === undefined) {
                    return {
                        success: false,
                        statusCode: 500,
                        message,
                        data: {}
                    }
                }

                return {
                    success,
                    statusCode,
                    message,
                    data
                }
            }).catch(err => {
                return {
                    success: false,
                    statusCode: 500,
                    message: err.message,
                    data: {}
                }
            })

    return result
}

export const delete_by_id = async (endpoint) => {
    var success = true
    const result = await fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}${endpoint}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200) {
                    success = false
                } else if (statusCode === undefined) {
                    return {
                        success: false,
                        statusCode: 500,
                        message,
                        data: {}
                    }
                }

                return {
                    success,
                    statusCode,
                    message,
                    data
                }
            }).catch(err => {
                return {
                    success: false,
                    statusCode: 500,
                    message: err.message,
                    data: {}
                }
            })

    return result
}

export const fetchData = async (type, child_id, start_date, end_date) => {
    // const date = formatDate(new Date());
    const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/${type}/${child_id}?start_date=${start_date}&end_date=${end_date}`

    const fetchedData = await fetch(query, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(resJson => {
            return resJson
        })
        .catch(err => {
            console.log(err)
        })
    // console.log(`${type} util/fetchData/fetchedData: `, fetchedData)
    return fetchedData
}

export const fetchClassData = async (type, class_id, start_date, end_date) => {
    const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/${type}/class/${class_id}?start_date=${start_date}&end_date=${end_date}`
    const fetchedData = await fetch(query, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(resJson => {
            // console.log('fetchClassData/resJson: /', resJson)
            return resJson
        })
        .catch(err => {
            console.log(err)
        })
    return fetchedData
}

export const fetchMessagesByConversationId = async (conversation_id, sender_id, recipient_id) => {
    console.log('fetchMessageByConvId/recipient_id', recipient_id)
    const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/message?conversation_id=${conversation_id}&sender_id=${sender_id}`
    const messageData = await fetch(query, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(resJson => {
            console.log('fetchMessagesByConversationId/resJson: ', resJson)
            const { messages, most_recently_read_message_id } = resJson.data
            if (resJson.statusCode === 200) {
                markRead(messages, sender_id, recipient_id)
                return {
                    success: true,
                    data: resJson.data
                }
            } else {
                return {
                    sucess: false,
                    data: resJson
                }
            }
        })
        .catch(err => {
            console.log('err: ', err)
            return {
                success: false,
                data: err
            }
        })
    return messageData
}

const markRead = (message_array, sender_id, recipient_id) => {
    // console.log('message_array: ', message_array)
    // const { sender_id, recipient_id } = this.state
    const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/message`

    const most_recent_message = message_array[0] ? message_array[0] : null
    if (most_recent_message === null || most_recent_message.sender_id === sender_id || most_recent_message.read_at !== null) {
        return
    }

    fetch(query, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            most_recent_message_id: most_recent_message.message_id,
            recipient_id
        })
    })
        .then(res => res.json())
        .then(resJson => {
            console.log('markRead/resJson: ', resJson)
        })
        .catch(err => console.log('err: ', err))
}

export const fetchReadReceipt = async (conversation_id,  sender_id) => {
    // const { conversation_id } = this.state.messageData
    // const sender_id = this.props.child_id
    const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/message/read-receipt?conversation_id=${conversation_id}&sender_id=${sender_id}`
    const success = true
    const message_id = await fetch(query, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(resJson => {
            console.log('parent/inboxcard/fetchReadReceipt/resJson: ', resJson)
            return resJson.data
        })
        .catch(err => {
            console.log('err: ', err)
            success = false
            return `err: ${err}`
        })
    return {
        success,
        data: message_id
    }
}

export const sendWellnessData = async (wellness_data, class_id, date) => {
    const { record_id_for_update} = wellness_data
    var data_objs = []

    if (record_id_for_update.size === 0) {
        return {
            success: true,
            data: []
        }
    }

    record_id_for_update.forEach((record_id) => {
        data_objs.push({
            record_id,
            ...wellness_data.records[record_id]
        })
    })
    normalize(data_objs)

    var request_body = {
        date,
        class_id,
        data_objs
    }

    const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/wellness/`
    
    const fetchResult = await fetch(query, {
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
            if (statusCode > 200 || statusCode === undefined) {
                return {
                    success: false,
                    statusCode,
                    message
                }
            }
            return {
                success: true,
                statusCode,
                message,
                data
            }
        })
        .catch(err => {
            return {
                success: false,
                message: err
            }
        })
    return fetchResult
}

function normalize(data_objs) {
    for (var i = 0; i < data_objs.length; i++) {
        data_objs[i].time = formatTime(data_objs[i].time)
    }
}