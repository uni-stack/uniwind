const ReactNative = require('react-native')

const components = {
    get ActivityIndicator() {
        return require('./native/ActivityIndicator').ActivityIndicator
    },
    get Button() {
        return require('./native/Button').Button
    },
    get FlatList() {
        return require('./native/FlatList').FlatList
    },
    get Image() {
        return require('./native/Image').Image
    },
    get ImageBackground() {
        return require('./native/ImageBackground').ImageBackground
    },
    get InputAccessoryView() {
        return require('./native/InputAccessoryView').InputAccessoryView
    },
    get KeyboardAvoidingView() {
        return require('./native/KeyboardAvoidingView').KeyboardAvoidingView
    },
    get Modal() {
        return require('./native/Modal').Modal
    },
    get Pressable() {
        return require('./native/Pressable').Pressable
    },
    get RefreshControl() {
        return require('./native/RefreshControl').RefreshControl
    },
    get SafeAreaView() {
        return require('./native/SafeAreaView').SafeAreaView
    },
    get ScrollView() {
        return require('./native/ScrollView').ScrollView
    },
    get SectionList() {
        return require('./native/SectionList').SectionList
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
    get TouchableHighlight() {
        return require('./native/TouchableHighlight').TouchableHighlight
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
    get View() {
        return require('./native/View').View
    },
    get VirtualizedList() {
        return require('./native/VirtualizedList').VirtualizedList
    },
}

Object.keys(ReactNative).forEach(key => {
    if (key in components) {
        return
    }

    Object.defineProperty(components, key, {
        configurable: true,
        enumerable: true,
        get: () => ReactNative[key],
    })
})

module.exports = components
