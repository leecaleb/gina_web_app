import React from 'react'
import { View, TouchableHighlight, Text } from 'react-native'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducer from '../../redux/school/reducers/index'
import TeacherHome from './teacherhome'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import SchoolHome from './schoolhome'
import TeacherClockInOut from './teacherclockinout';
// import DismissChildQRScan from './dismisschildqrscan';
import TeacherMedicineLog from './logs/medicinelog';
import WellnessLog from './logs/wellnesslog';
import TeacherAppetiteLog from './logs/appetitelog';
import TeacherSleepLog from './logs/sleeplog';
import TeacherMilkLog from './logs/milklog';
import DiaperLog from './logs/diaperlog';
import AdminHome from './admin/adminhome'
import Registration from './admin/registration'
import Students from './admin/students'
import Teachers from './admin/teachers'
import MessageForParents from './messageforparents'
import AttendancePage from './attendancepage'
import PickupAlert from './pickupalert'
import Inbox from './inbox'
import DownloadPage from './admin/downloadpage'
import DownloadTeacherAttendance from './admin/downloadteacherattendance'

const store = createStore(reducer)
const Stack = createStackNavigator()

export default class SchoolApp extends React.Component {

    render() {
        return (
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator 
                        initialRouteName="SchoolHome"
                        screenOptions={{
                            gestureEnabled: false,
                            headerTitleStyle: {
                                fontWeight: 'bold',
                                fontSize: 30
                            },
                            // cardStyle: { backgroundColor: 'transparent' },
                            // cardOverlayEnabled: true,
                            // cardStyleInterpolator: ({ current: { progress } }) => ({
                            //     cardStyle: {
                            //         opacity: progress.interpolate({
                            //         inputRange: [0, 0.5, 0.9, 1],
                            //         outputRange: [0, 0.25, 0.7, 1],
                            //         }),
                            //     },
                            //     overlayStyle: {
                            //         opacity: progress.interpolate({
                            //         inputRange: [0, 1],
                            //         outputRange: [0, 0.5],
                            //         extrapolate: 'clamp',
                            //         }),
                            //     },
                            // }),
                        }}
                    >
                        <Stack.Screen 
                            name="SchoolHome"
                            component={SchoolHome}
                            initialParams={{
                                school_id: this.props.school_id,
                                school_name: this.props.school_name,
                                loadAuth: this.props.loadAuth
                            }}
                            options={{ 
                                title: '',
                                headerRight: () => (
                                    <TouchableHighlight
                                        style={{ padding: 10, marginRight: 20 }}
                                        onPress={() => this.props.handleSignOut()}
                                    >
                                        <Text style={{ fontSize: 30 }}>登出</Text>
                                    </TouchableHighlight>
                                )
                            }}
                        />
                        <Stack.Screen 
                            name="AdminHome"
                            component={AdminHome}
                            options={{ gestureEnabled: true, title: '' }}
                        />
                        <Stack.Screen 
                            name="Registration"
                            component={Registration}
                            options={{ headerLeft: null, title: '' }}
                        />
                        <Stack.Screen 
                            name="Students"
                            component={Students}
                            options={{ gestureEnabled: true, title: '' }}
                        />
                        <Stack.Screen 
                            name="Teachers"
                            component={Teachers}
                            options={{ gestureEnabled: true, title: '' }}
                        />
                        <Stack.Screen 
                            name="DownloadPage"
                            component={DownloadPage}
                            options={{ gestureEnabled: true, title: '下載' }}
                        />
                        <Stack.Screen 
                            name="DownloadTeacherAttendance"
                            component={DownloadTeacherAttendance}
                            options={{ gestureEnabled: true, title: '學生出勤下載' }}
                        />
                        <Stack.Screen 
                            name="AttendancePage"
                            component={AttendancePage}
                            options={{
                                title: '出席/打卡',
                                headerRight: () => (
                                    <View style={{ paddingRight: 20 }}>
                                        <Text style={{ fontSize: 30 }}>{'值班老師：未登入'}</Text>
                                    </View>
                                )
                            }}
                        />
                        <Stack.Screen 
                            name="TeacherHome"
                            component={TeacherHome}
                            options={{ headerLeft: null, title: '' }}
                        />
                        <Stack.Screen 
                            name="Inbox"
                            component={Inbox}
                            options={{gestureEnabled: true, title: '' }}
                        />
                        <Stack.Screen
                            name="PickupAlert"
                            component={PickupAlert}
                        />
                        <Stack.Screen 
                            name="TeacherClockInOut"
                            component={TeacherClockInOut}
                            options={{ gestureEnabled: true, title: '打卡' }}
                        />
                        <Stack.Screen 
                            name="TeacherMedicineLog"
                            component={TeacherMedicineLog}
                            options={{ gestureEnabled: true, title: '托藥單' }}
                        />
                        <Stack.Screen 
                            name="WellnessLog"
                            component={WellnessLog}
                            options={{ gestureEnabled: true, title: '健康', headerLeft: null }}
                        />
                        <Stack.Screen 
                            name="MessageForParents"
                            component={MessageForParents}
                            options={{ gestureEnabled: true, title: '老師留⾔', headerLeft: null }}
                        />
                        <Stack.Screen 
                            name="TeacherAppetiteLog"   
                            component={TeacherAppetiteLog}
                            options={{ gestureEnabled: true, title: '飲食', headerLeft: null }}
                        />
                        <Stack.Screen 
                            name="TeacherSleepLog"
                            component={TeacherSleepLog}
                            options={{ gestureEnabled: true, title: '睡眠', headerLeft: null }}
                        />
                        <Stack.Screen 
                            name="TeacherMilkLog"
                            component={TeacherMilkLog}
                            options={{ gestureEnabled: true, title: '餵奶', headerLeft: null }}
                        />
                        <Stack.Screen 
                            name="DiaperLog"
                            component={DiaperLog}
                            options={{ gestureEnabled: true, title: '如廁', headerLeft: null }}
                        />
                        
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        )
    }
}