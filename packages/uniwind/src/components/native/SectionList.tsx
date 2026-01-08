import { SectionList as RNSectionList, SectionListProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const SectionList = copyComponentProperties(RNSectionList, (props: SectionListProps<unknown, unknown>) => {
    const style = useStyle(props.className, props)
    const contentContainerStyle = useStyle(props.contentContainerClassName, props)
    const listFooterComponentStyle = useStyle(props.ListFooterComponentClassName, props)
    const listHeaderComponentStyle = useStyle(props.ListHeaderComponentClassName, props)
    const endFillColor = useStyle(props.endFillColorClassName, props).accentColor

    return (
        <RNSectionList
            {...props}
            style={[style, props.style]}
            contentContainerStyle={[contentContainerStyle, props.contentContainerStyle]}
            ListFooterComponentStyle={[listFooterComponentStyle, props.ListFooterComponentStyle]}
            ListHeaderComponentStyle={[listHeaderComponentStyle, props.ListHeaderComponentStyle]}
            endFillColor={props.endFillColor ?? endFillColor}
        />
    )
})

export default SectionList
