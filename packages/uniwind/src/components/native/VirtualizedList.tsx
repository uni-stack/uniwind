import { VirtualizedList as RNVirtualizedList, VirtualizedListProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const VirtualizedList = copyComponentProperties(RNVirtualizedList, (props: VirtualizedListProps<unknown>) => {
    const style = useStyle(props.className, props)
    const contentContainerStyle = useStyle(props.contentContainerClassName, props)
    const listFooterComponentStyle = useStyle(props.ListFooterComponentClassName, props)
    const listHeaderComponentStyle = useStyle(props.ListHeaderComponentClassName, props)
    const endFillColor = useStyle(props.endFillColorClassName, props).accentColor

    return (
        <RNVirtualizedList
            {...props}
            style={[style, props.style]}
            contentContainerStyle={[contentContainerStyle, props.contentContainerStyle]}
            ListFooterComponentStyle={[listFooterComponentStyle, props.ListFooterComponentStyle]}
            ListHeaderComponentStyle={[listHeaderComponentStyle, props.ListHeaderComponentStyle]}
            endFillColor={props.endFillColor ?? endFillColor}
        />
    )
})

export default VirtualizedList
