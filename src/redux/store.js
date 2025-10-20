import { createStore, combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import parentReducers from './parent/reducers'
import schoolReducers from './school/reducers'
import { SetTransform, SetMessageTransform, SetAppetiteTransform, SetSleepTransform } from './transforms'

// Combine all reducers
const rootReducer = combineReducers({
  parent: parentReducers,
  school: schoolReducers
})

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage,
  transforms: [SetTransform, SetMessageTransform, SetAppetiteTransform, SetSleepTransform],
  whitelist: ['parent', 'school'] // Only persist these reducers
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create store
export const store = createStore(
  persistedReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export const persistor = persistStore(store)
