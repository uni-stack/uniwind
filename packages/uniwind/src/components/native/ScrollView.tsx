import { ScrollView as RNScrollView, ScrollViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const ScrollView = copyComponentProperties(RNScrollView, (props: ScrollViewProps) => {
    const style = useStyle(props.className, props)
    const contentContainerStyle = useStyle(props.contentContainerClassName, props)
    const endFillColor = useStyle(props.endFillColorClassName, props).accentColor

    return (
        <RNScrollView
            {...props}
            style={[style, props.style]}
            contentContainerStyle={[contentContainerStyle, props.contentContainerStyle]}
            endFillColor={props.endFillColor ?? endFillColor}
        />
    )
})

export default ScrollView
