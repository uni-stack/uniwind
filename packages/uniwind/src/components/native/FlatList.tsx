import { FlatList as RNFlatList, FlatListProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const FlatList = copyComponentProperties(RNFlatList, (props: FlatListProps<unknown>) => {
    const { Component, style } = useStyle(RNFlatList, props.className)
    const styleColumnWrapper = useStyle(props.columnWrapperClassName)
    const styleContentContainer = useStyle(props.contentContainerClassName)
    const styleListFooterComponent = useStyle(props.ListFooterComponentClassName)
    const styleListHeaderComponent = useStyle(props.ListHeaderComponentClassName)
    const endFillColor = useUniwindAccent(props.endFillColorClassName)
    const hasSingleColumn = !('numColumns' in props) || props.numColumns === 1

    return (
        <Component
            {...props}
            style={[style, props.style]}
            columnWrapperStyle={hasSingleColumn ? undefined : [styleColumnWrapper, props.columnWrapperStyle]}
            contentContainerStyle={[styleContentContainer, props.contentContainerStyle]}
            ListFooterComponentStyle={[styleListFooterComponent, props.ListFooterComponentStyle]}
            ListHeaderComponentStyle={[styleListHeaderComponent, props.ListHeaderComponentStyle]}
            endFillColor={props.endFillColor ?? endFillColor}
        />
    )
})

export default FlatList
