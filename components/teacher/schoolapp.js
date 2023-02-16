import React from 'react'
import { View, TouchableHighlight, Text } from 'react-native'
import {
    BrowserRouter,
    Routes,
    Route,
  } from "react-router-dom";
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
import Announcement from './admin/announcement'
import Registration from './admin/registration'
import Students from './admin/students'
import Teachers from './admin/teachers'
import MessageForParents from './messageforparents'
import AttendancePage from './attendancepageW'
import PickupAlert from './pickupalert'
import Inbox from './inbox'
import DownloadPage from './admin/downloadpage'
import DownloadTeacherAttendance from './admin/downloadteacherattendance'
import AnnouncementHome from './admin/announcementhome'
import AddAnnouncementPage from './admin/addannouncementpage'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/integration/react'
import { SetTransform, SetMessageTransform, SetAppetiteTransform, SetSleepTransform } from '../../redux/transforms'
// import SetMessageTransform from '../../redux/transforms'

const persistConfig = {
    key: 'root',
    storage,
    transforms: [SetTransform, SetMessageTransform, SetAppetiteTransform, SetSleepTransform]
}
  
const persistedReducer = persistReducer(persistConfig, reducer)

const store = createStore(persistedReducer)
// const store = createStore(reducer)
let persistor = persistStore(store)
// console.log('persistedReducer: ', persistedReducer)
// console.log('store.getState(): ', store.getState())
const SchoolApp = (props) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                    <Routes>
                        <Route exact path="/" element={<SchoolHome {...props} />} />
                        <Route path="/class" element={<TeacherHome />} />
                        <Route path="/class/inbox" element={<Inbox />} />
                        <Route path="/class/medication" element={<TeacherMedicineLog />} />
                        <Route path="/class/wellness" element={<WellnessLog />} />
                        <Route path="/class/message" element={<MessageForParents />} />
                        <Route path="/class/appetite" element={<TeacherAppetiteLog />} />
                        <Route path="/class/sleep" element={<TeacherSleepLog />} />
                        <Route path="/admin" element={<AdminHome />} />
                        <Route path="/admin/announcement" element={<AnnouncementHome />} />
                        <Route path="/admin/announcement/:id" element={<Announcement />} />
                        <Route path="/admin/announcement/new" element={<AddAnnouncementPage />} />
                        <Route path="/attendance" element={<AttendancePage />} />
                    </Routes>
                </BrowserRouter>
            </PersistGate>
            {/* 
                    <Stack.Screen 
                        name="AdminHome"
                        component={AdminHome}
                        options={{ gestureEnabled: true, title: '' }}
                    />
                    <Stack.Screen 
                        name="Announcement"
                        component={Announcement}
                        options={{ gestureEnabled: true, title: '公告' }}
                    />
                    <Stack.Screen
                        name="AnnouncementHome"
                        component={AnnouncementHome}
                        options={{ gestureEnabled: true, title: '公告首頁' }}
                    />
                    <Stack.Screen
                        name="AddAnnouncementPage"
                        component={AddAnnouncementPage}
                        options={{ gestureEnabled: true, title: '新增公告' }}
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
                        options={{ gestureEnabled: true, title: '健康' }}
                    />
                    <Stack.Screen 
                        name="MessageForParents"
                        component={MessageForParents}
                        options={{ gestureEnabled: true, title: '老師留⾔' }}
                    />
                    <Stack.Screen 
                        name="TeacherAppetiteLog"   
                        component={TeacherAppetiteLog}
                        options={{ gestureEnabled: true, title: '飲食' }}
                    />
                    <Stack.Screen 
                        name="TeacherSleepLog"
                        component={TeacherSleepLog}
                        options={{ gestureEnabled: true, title: '睡眠' }}
                    />
                    <Stack.Screen 
                        name="TeacherMilkLog"
                        component={TeacherMilkLog}
                        options={{ gestureEnabled: true, title: '餵奶' }}
                    />
                    <Stack.Screen 
                        name="DiaperLog"
                        component={DiaperLog}
                        options={{ gestureEnabled: true, title: '如廁' }}
                    />
                    
                </Stack.Navigator>
            </NavigationContainer> */}
        </Provider>
    )
}

export default SchoolApp