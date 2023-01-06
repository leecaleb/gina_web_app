// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import React from 'react'
import AuthLoading from './components/auth/authloading'
import { View, Text, TextInput, Image } from 'react-native'
import { Root } from 'native-base'
import Amplify from 'aws-amplify'
import cognito_auth from './configuration/aws-cognito-auth'
import { AppLoading, SplashScreen } from 'expo'
import { Asset } from 'expo-asset'

Amplify.configure(cognito_auth)

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isSplashReady: false,
      isAppReady: false
    }
    // SplashScreen.preventAutoHide()
  }
  

  _cacheSplashResourcesAsync = async () => {
    const gif = require('./assets/app-splash.gif');
    return Asset.fromModule(gif).downloadAsync();
  };

  _cacheResourcesAsync = async () => {
    // SplashScreen.hide();
    const images = [
      require('./assets/app_logo.png')
    ];

    const cacheImages = images.map(image => {
      return Asset.fromModule(image).downloadAsync();
    });

    await Promise.all(cacheImages);
    this.setState({ isAppReady: true });
  };

  render() {
    // console.log('isAppReady: ', isAppReady)
    // const { isSplashReady, isAppReady } = this.state
    // if (!isSplashReady) {
    //   return (
    //     <AppLoading
    //       startAsync={this._cacheSplashResourcesAsync}
    //       onFinish={() => this.setState({ isSplashReady: true })}
    //       onError={console.warn}
    //       autoHideSplash={false}
    //     />
    //   )
    // }

    // if (!isAppReady) {
    //   return (
    //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //       <Image
    //         source={require('./assets/app-splash.gif')}
    //         style={{ height: 200, aspectRatio: 1 }}
    //         onLoad={this._cacheResourcesAsync}
    //       />
    //     </View>
    //   )
    // }

    return (
      // <Root>
        <AuthLoading />
      // </Root>
    )
  }
}

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;