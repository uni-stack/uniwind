import { ScrollViewProps } from 'react-native'
import { ScrollView as RNGHScrollView } from 'react-native-gesture-handler'
import { useUniwindAccent } from '../../../hooks'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const ScrollView = copyComponentProperties(RNGHScrollView, (props: ScrollViewProps) => {
    const style = useStyle(props.className)
    const contentContainerStyle = useStyle(props.contentContainerClassName)
    const endFillColor = useUniwindAccent(props.endFillColorClassName)

    return (
        <RNGHScrollView
            {...props}
            style={[style, props.style]}
            contentContainerStyle={[contentContainerStyle, props.contentContainerStyle]}
            endFillColor={props.endFillColor ?? endFillColor}
        />
    )
})

export default ScrollView
