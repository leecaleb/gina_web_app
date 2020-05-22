import React from 'react'
import { Container, Content, Text } from 'native-base'
import QRCodeScan from '../qrcodescan'
import Header from '../header'

export default class ReceiveChildQRScan extends React.Component {
    static navigationOptions = {
        headerTitle: <Header title={'接小孩入園'} />,
    }

    render () {
        return (
            <Container>
                <Content contentContainerStyle={{ flex:1, alignItems: 'center', justifyContent: 'center' }}>
                    <QRCodeScan
                        action={1} />
                </Content>
            </Container>
        )
    }
}