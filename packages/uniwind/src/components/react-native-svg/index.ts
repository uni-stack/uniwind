// Re-export everything from react-native-svg
import * as Svg from 'react-native-svg'

module.exports = {
    ...Svg,
    get Svg() {
        return require('./native/Svg').Svg
    },
    get default() {
        return require('./native/Svg').default
    },
}
