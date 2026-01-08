import { FlatList as RNFlatList, FlatListProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const FlatList = copyComponentProperties(RNFlatList, (props: FlatListProps<unknown>) => {
    const style = useStyle(props.className, props)
    const styleColumnWrapper = useStyle(props.columnWrapperClassName, props)
    const styleContentContainer = useStyle(props.contentContainerClassName, props)
    const styleListFooterComponent = useStyle(props.ListFooterComponentClassName, props)
    const styleListHeaderComponent = useStyle(props.ListHeaderComponentClassName, props)
    const endFillColor = useStyle(props.endFillColorClassName, props).accentColor
    const hasSingleColumn = !('numColumns' in props) || props.numColumns === 1

    return (
        <RNFlatList
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
