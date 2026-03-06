import { Animated as RNAnimated } from 'react-native'
import { FlatList } from './FlatList'
import { generateDataSet } from './generateDataSet'
import { Image } from './Image'
import { ScrollView } from './ScrollView'
import { SectionList } from './SectionList'
import { Text } from './Text'
import { View } from './View'

// source: https://github.com/necolas/react-native-web/tree/master/packages/react-native-web/src/vendor/react-native/Animated/components

export const Animated = {
    ...RNAnimated,
    FlatList: RNAnimated.createAnimatedComponent((props) => <FlatList scrollEventThrottle={0.0001} {...props} dataSet={generateDataSet(props)} />),
    ScrollView: RNAnimated.createAnimatedComponent((props) => (
        <ScrollView
            scrollEventThrottle={0.0001}
            {...props}
            dataSet={generateDataSet(props)}
        />
    )),
    SectionList: RNAnimated.createAnimatedComponent((props) => (
        <SectionList scrollEventThrottle={0.0001} {...props} dataSet={generateDataSet(props)} />
    )),
    Image: RNAnimated.createAnimatedComponent(Image),
    Text: RNAnimated.createAnimatedComponent(Text),
    View: RNAnimated.createAnimatedComponent(View),
}
