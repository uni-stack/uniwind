import { SectionList as RNSectionList, SectionListProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const SectionList = copyComponentProperties(RNSectionList, (props: SectionListProps<unknown, unknown>) => {
    const { Component, style } = useStyle(RNSectionList, props.className)
    const contentContainerStyle = useStyle(props.contentContainerClassName)
    const listFooterComponentStyle = useStyle(props.ListFooterComponentClassName)
    const listHeaderComponentStyle = useStyle(props.ListHeaderComponentClassName)
    const endFillColor = useUniwindAccent(props.endFillColorClassName)

    return (
        <Component
            {...props as any}
            style={[style, props.style]}
            contentContainerStyle={[contentContainerStyle, props.contentContainerStyle]}
            ListFooterComponentStyle={[listFooterComponentStyle, props.ListFooterComponentStyle]}
            ListHeaderComponentStyle={[listHeaderComponentStyle, props.ListHeaderComponentStyle]}
            endFillColor={props.endFillColor ?? endFillColor}
        />
    )
})

export default SectionList
