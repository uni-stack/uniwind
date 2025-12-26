module.exports = {
    get BaseButton() {
        return require('./native/BaseButton').BaseButton
    },
    get BorderlessButton() {
        return require('./native/BorderlessButton').BorderlessButton
    },
    get DrawerLayoutAndroid() {
        return require('./native/DrawerLayoutAndroid').DrawerLayoutAndroid
    },
    get FlatList() {
        return require('./native/FlatList').FlatList
    },
    get GestureHandlerRootView() {
        return require('./native/GestureHandlerRootView').GestureHandlerRootView
    },
    get Pressable() {
        return require('./native/Pressable').Pressable
    },
    get PureNativeButton() {
        return require('./native/PureNativeButton').PureNativeButton
    },
    get RawButton() {
        return require('./native/RawButton').RawButton
    },
    get RectButton() {
        return require('./native/RectButton').RectButton
    },
    get RefreshControl() {
        return require('./native/RefreshControl').RefreshControl
    },
    get ScrollView() {
        return require('./native/ScrollView').ScrollView
    },
    get Switch() {
        return require('./native/Switch').Switch
    },
    get Text() {
        return require('./native/Text').Text
    },
    get TextInput() {
        return require('./native/TextInput').TextInput
    },
    get TouchableNativeFeedback() {
        return require('./native/TouchableNativeFeedback').TouchableNativeFeedback
    },
    get TouchableOpacity() {
        return require('./native/TouchableOpacity').TouchableOpacity
    },
    get TouchableWithoutFeedback() {
        return require('./native/TouchableWithoutFeedback').TouchableWithoutFeedback
    },

    // Re-export non-component exports from react-native-gesture-handler
    get DrawerLayout() {
        return require('react-native-gesture-handler').DrawerLayout
    },
    get Swipeable() {
        return require('react-native-gesture-handler').Swipeable
    },
    get TouchableHighlight() {
        return require('react-native-gesture-handler').TouchableHighlight
    },
    get Directions() {
        return require('react-native-gesture-handler').Directions
    },
    get State() {
        return require('react-native-gesture-handler').State
    },
    get PointerType() {
        return require('react-native-gesture-handler').PointerType
    },
    get gestureHandlerRootHOC() {
        return require('react-native-gesture-handler').gestureHandlerRootHOC
    },
    get GestureDetector() {
        return require('react-native-gesture-handler').GestureDetector
    },
    get Gesture() {
        return require('react-native-gesture-handler').Gesture
    },
    get TapGestureHandler() {
        return require('react-native-gesture-handler').TapGestureHandler
    },
    get ForceTouchGestureHandler() {
        return require('react-native-gesture-handler').ForceTouchGestureHandler
    },
    get LongPressGestureHandler() {
        return require('react-native-gesture-handler').LongPressGestureHandler
    },
    get PanGestureHandler() {
        return require('react-native-gesture-handler').PanGestureHandler
    },
    get PinchGestureHandler() {
        return require('react-native-gesture-handler').PinchGestureHandler
    },
    get RotationGestureHandler() {
        return require('react-native-gesture-handler').RotationGestureHandler
    },
    get FlingGestureHandler() {
        return require('react-native-gesture-handler').FlingGestureHandler
    },
    get createNativeWrapper() {
        return require('react-native-gesture-handler').createNativeWrapper
    },
    get NativeViewGestureHandler() {
        return require('react-native-gesture-handler').NativeViewGestureHandler
    },
    get HoverEffect() {
        return require('react-native-gesture-handler').HoverEffect
    },
    get MouseButton() {
        return require('react-native-gesture-handler').MouseButton
    },
    get enableExperimentalWebImplementation() {
        return require('react-native-gesture-handler').enableExperimentalWebImplementation
    },
    get enableLegacyWebImplementation() {
        return require('react-native-gesture-handler').enableLegacyWebImplementation
    },
}
