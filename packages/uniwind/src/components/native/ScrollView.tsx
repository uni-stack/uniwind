import { ScrollView as RNScrollView, ScrollViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const ScrollView = copyComponentProperties(RNScrollView, (props: ScrollViewProps) => {
    const style = useStyle(props.className, props, undefined, 'ScrollView')
    const contentContainerStyle = useStyle(props.contentContainerClassName, props)
    const endFillColor = useAccentColor(props.endFillColorClassName, props)

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
