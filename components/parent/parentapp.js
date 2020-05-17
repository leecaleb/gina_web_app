import React from 'react'
import { TouchableHighlight, Text } from 'react-native'
import { Provider } from 'react-redux'
import { createStore } from 'redux';
import reducer from '../../redux/parent/reducers/index'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import ParentHome from './parenthome'
import MedicationRequestPage from './medicationrequestpage'
import AbsenceExcusePage from './absenceexcusepage'
import PickupRequest from './pickuprequest'
import AddMedicationRequestPage from './addmedicationrequestpage'

const store = createStore(reducer)
const Stack = createStackNavigator()

export default class ParentApp extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="ParentHome"
                        screenOptions={{
                            gestureEnabled: true,
                            headerTitleStyle: {
                                fontWeight: 'bold',
                                fontSize: 30
                            }
                        }}
                    >
                        <Stack.Screen
                            name="ParentHome"
                            component={ParentHome}
                            initialParams={{
                                parent_id: this.props.parent_id,
                                loadAuth: this.props.loadAuth
                            }}
                            options={{
                                title: '家長首頁',
                                headerRight: () => (
                                    <TouchableHighlight
                                        style={{ padding: 10, marginRight: 20 }}
                                        onPress={() => this.props.handleSignOut()}
                                    >
                                        <Text>登出</Text>
                                    </TouchableHighlight>
                                )
                            }}
                        />
                        <Stack.Screen
                            name="PickupRequest"
                            component={PickupRequest}
                            options={{ title: '接回告知' }}
                        />
                        <Stack.Screen
                            name="MedicationRequestPage"
                            component={MedicationRequestPage}
                            options={{ title: '托藥單' }}
                        />
                        <Stack.Screen
                            name="AddMedicationRequestPage"
                            component={AddMedicationRequestPage}
                            options={{ title: '新增托藥單' }}
                        />
                        <Stack.Screen 
                            name="AbsenceExcusePage"
                            component={AbsenceExcusePage}
                            options={{ title: '請假單' }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        )
    }
}