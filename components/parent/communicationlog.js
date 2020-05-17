import React from 'react'
import { StyleSheet } from 'react-native'
import { Container, Header, Content, View, Card, CardItem, Body, Text, Button } from 'native-base'
import Icon from 'react-native-vector-icons/Ionicons'

export default class CommunicationLog extends React.Component {
    ///TODO: include pictures in the comments section
    constructor(props) {
        super(props)
        this.state = {
            child_id: this.props.navigation.state.params.child_id
        }
    }

    render () {
        return (
            <Container contentContainerStyle={{ flex: 1, alignItems: 'center' }}>
                <Header>
                    <Text style={{ fontSize: 25 }}>生活小點滴</Text>
                </Header>
                <Content>
                    
                    <Card style={{ width: '90%', height: 300, alignSelf: 'center', marginTop: 10 }}>
                        <CardItem>
                            <Body>
                                <Text>
                                    Comments from Teacher
                                    blah
                                    blah
                                    blah blah
                                </Text>
                            </Body>
                        </CardItem>
                    </Card>

                    <Card style={{ width: '90%', alignSelf: 'center' }}>
                        <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 5 }}>Health</Text>
                        <CardItem>
                            <Body>
                                <Icon 
                                    name='ios-thermometer' 
                                    size={20} 
                                    color='#C93D1B'>
                                    <Text>  98.6 ºF  She's coughing less today. She was energetic; running around during lunch break</Text>
                                </Icon>
                            </Body>
                        </CardItem>
                    </Card>

                    <View style={styles.buttonContainer}>
                        <Button
                            style={styles.button} 
                            onPress={() => {this.props.navigation.navigate('FoodLogPage', {child_id: this.state.child_id})}}>
                            <Text>飲食</Text>
                        </Button>

                        <Button
                            style={styles.button}
                            onPress={() => {this.props.navigation.navigate('MilkLogPage', {child_id: this.state.child_id})}}>
                            <Text>喝奶</Text>
                        </Button>

                        <Button
                            style={styles.button}
                            onPress={() => {this.props.navigation.navigate('WaterLogPage', {child_id: this.state.child_id})}}>
                            <Text>喝水</Text>
                        </Button>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button style={styles.button}>
                            <Text>喂藥</Text>
                        </Button>

                        <Button
                            style={styles.button}
                            onPress={() => {this.props.navigation.navigate('SleepLogPage', {child_id: this.state.child_id})}}>
                            <Text>睡眠</Text>
                        </Button>

                        <Button
                            style={styles.button}
                            onPress={() => this.props.navigation.navigate('RestroomLogPage', {child_id: this.state.child_id})}>
                            <Text>如廁</Text>
                        </Button>
                    </View>
                </Content>
            </Container>
        )   
    }
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#F9DA84'
    },
    buttonContainer: {
        flex:1,
        width: '90%',
        alignSelf: 'center',
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
})
