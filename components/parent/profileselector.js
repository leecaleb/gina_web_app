import React, {useState, forwardRef, useImperativeHandle} from 'react'
import { Animated, Dimensions, Image, TouchableHighlight } from 'react-native'

const ProfileSelector = forwardRef((props, ref) => {
  // constructor(props) {
  //   super(props)
  //   this.state = {
  //     showSelector: false,
  //     SlideInRight: new Animated.Value(0)
  //   }
  // }

  const [state, setState] = useState({
    showSelector: false,
    SlideInRight: new Animated.Value(0)
  })

  useImperativeHandle(ref, () => ({    
    slideIn() {
      setState({
        ...state,
        showSelector: true
      })

      Animated.timing(
        state.SlideInRight,
        {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
        }
      ).start()
    }
  }));

  // slideIn() {
  //   this.setState({
  //     showSelector: true
  //   } , () => {
  //     Animated.timing(
  //       this.state.SlideInRight,
  //       {
  //           toValue: 1,
  //           duration: 200,
  //           useNativeDriver: true
  //       }
  //     ).start()
  //   })
  // }

  const onSelectStudent = (student_id) => {
    props.onSelectStudent(student_id)
    Animated.timing(
      state.SlideInRight,
      {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
      }
    ).start()
    setState({
      ...state,
      showSelector: false
    })
  }

    const windowWidth = Dimensions.get('window').width
    const { showSelector, SlideInRight } = state
    const { student_of_id } = props
    if (!showSelector) {
      return null
    }
    return (
      <Animated.View
        style={{
          zIndex: 2,
          width: '100%',
          height: '100%',
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0,0.7)',
          transform: [
            {
                translateX: SlideInRight.interpolate({
                    inputRange: [0,1],
                    outputRange: [windowWidth, 0]
                })
            }
          ],
          alignItems: 'center',
          // justifyContent: 'space-evenly'
        }}
      >
        {Object.keys(student_of_id).map((student_id) => {
          return (
            <TouchableHighlight 
              key={student_id}
              style={{ marginTop: windowWidth/4 }}
              onPress={() => onSelectStudent(student_id)}
              underlayColor='transparent'
            >
              <Image
                    source={
                      student_of_id[student_id].profile_picture === '' ?
                        require('../../assets/icon-thumbnail.png')
                        : { uri: student_of_id[student_id].profile_picture }
                      }
                    style={{
                        width: 160,
                        height: 160,
                        borderRadius: 80,
                        backgroundColor: 'rgba(255,255,255,0.6)'
                    }}
                />
            </TouchableHighlight>
          )
        })}
      </Animated.View>
    )
})

export default ProfileSelector