import React from 'react'
import { TouchableHighlight, Text, TouchableOpacity } from 'react-native'
import { Provider } from 'react-redux'
import { createStore } from 'redux';
import reducer from '../../redux/parent/reducers/index'
import {
    BrowserRouter,
    Routes,
    Route,
  } from "react-router-dom";
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import ParentHome from './parenthome'
import MedicationRequestPage from './medicationrequestpage'
import AbsenceExcusePage from './absenceexcusepage'
import PickupRequest from './pickuprequest'
import AddMedicationRequestPage from './addmedicationrequestpage'
import AnnouncementPage from './announcementpage'
import ViewImagePage from '../viewimagepage'
import AnnouncementListPage from './announcementlistpage';
import ParentDownloadPage from './mainmenu/downloadpage'
import storage from 'redux-persist/lib/storage'
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'


// const store = createStore(reducer)
// const Stack = createStackNavigator()

const persistConfig = {
    key: 'root',
    storage,
    transforms: []
}
  
const persistedReducer = persistReducer(persistConfig, reducer)

const store = createStore(persistedReducer)
let persistor = persistStore(store)

const ParentApp = (props) => {
    // props.handleSignOut()
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                    <Routes>
                        <Route exact path="/" element={<ParentHome {...props} />} />
                        <Route path="/pickup" element={<PickupRequest />} />
                        <Route path="/med-request" element={<MedicationRequestPage />} />
                        <Route path="/absence-request" element={<AbsenceExcusePage />} />
                        <Route path="/add-med-request" element={<AddMedicationRequestPage />} />
                        {/* <Route path="/class/inbox" element={<Inbox />} />
                        <Route path="/class/medication" element={<TeacherMedicineLog />} />
                        <Route path="/class/wellness" element={<WellnessLog />} />
                        <Route path="/class/message" element={<MessageForParents />} />
                        <Route path="/class/appetite" element={<TeacherAppetiteLog />} />
                        <Route path="/class/sleep" element={<TeacherSleepLog />} />
                        <Route path="/admin" element={<AdminHome />} />
                        <Route path="/admin/announcement" element={<AnnouncementHome />} />
                        <Route path="/admin/announcement/:id" element={<Announcement />} />
                        <Route path="/admin/announcement/new" element={<AddAnnouncementPage />} />
                        <Route path="/attendance" element={<AttendancePage />} /> */}
                    </Routes>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    )
    // render() {
    //     return (
    //         <Provider store={store}>
    //             <NavigationContainer>
    //                 <Stack.Navigator
    //                     initialRouteName="ParentHome"
    //                     screenOptions={{
    //                         gestureEnabled: true,
    //                         headerTitleStyle: {
    //                             fontWeight: 'bold',
    //                             fontSize: 30
    //                         }
    //                     }}
    //                 >
    //                     <Stack.Screen
    //                         name="ParentHome"
    //                         component={ParentHome}
    //                         initialParams={{
    //                             parent_id: this.props.parent_id,
    //                             loadAuth: this.props.loadAuth
    //                         }}
    //                         options={{
    //                             title: '家長首頁',
    //                             headerRight: () => (
    //                                 <TouchableHighlight
    //                                     style={{ padding: 10, marginRight: 20 }}
    //                                     onPress={() => this.props.handleSignOut()}
    //                                 >
    //                                     <Text>登出</Text>
    //                                 </TouchableHighlight>
    //                             ),
    //                             headerLeft: null
    //                         }}
    //                     />
    //                     {/* <Stack.Screen
    //                         name="ViewImagePage"
    //                         component={ViewImagePage}
    //                         options={{ 
    //                             title: '',
    //                             headerRight: () => (
    //                                 <TouchableHighlight
    //                                     style={{ padding: 10, marginRight: 20 }}
    //                                     // onPress={() => this.props.handleSignOut()}
    //                                 >
    //                                     <Text></Text>
    //                                 </TouchableHighlight>
    //                             )
    //                     }}
    //                     /> */}
    //                     <Stack.Screen
    //                         name="DownloadPage"
    //                         component={ParentDownloadPage}
    //                         options={{ title: '資料下載' }}
    //                     />
    //                     <Stack.Screen
    //                         name="PickupRequest"
    //                         component={PickupRequest}
    //                         options={{ title: '接回告知' }}
    //                     />
    //                     <Stack.Screen
    //                         name="MedicationRequestPage"
    //                         component={MedicationRequestPage}
    //                         options={{ title: '托藥單' }}
    //                     />
    //                     <Stack.Screen
    //                         name="AddMedicationRequestPage"
    //                         component={AddMedicationRequestPage}
    //                         options={{ title: '新增托藥單' }}
    //                     />
    //                     <Stack.Screen 
    //                         name="AbsenceExcusePage"
    //                         component={AbsenceExcusePage}
    //                         options={{ title: '請假單' }}
    //                     />
    //                     <Stack.Screen
    //                         name="AnnouncementPage"
    //                         component={AnnouncementPage}
    //                         options={{ title: '公告' }}
    //                     />
    //                     <Stack.Screen
    //                         name="AnnouncementListPage"
    //                         component={AnnouncementListPage}
    //                         options={{ title: '公告' }}
    //                     />
    //                 </Stack.Navigator>
    //             </NavigationContainer>
    //         </Provider>
    //     )
    // }
}

export default ParentApp