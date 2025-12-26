import { FlatListProps } from 'react-native'
import { FlatList as RNGHFlatList } from 'react-native-gesture-handler'
import { useUniwindAccent } from '../../../hooks'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const FlatList = copyComponentProperties(RNGHFlatList, (props: FlatListProps<unknown>) => {
    const style = useStyle(props.className)
    const styleColumnWrapper = useStyle(props.columnWrapperClassName)
    const styleContentContainer = useStyle(props.contentContainerClassName)
    const styleListFooterComponent = useStyle(props.ListFooterComponentClassName)
    const styleListHeaderComponent = useStyle(props.ListHeaderComponentClassName)
    const endFillColor = useUniwindAccent(props.endFillColorClassName)
    const hasSingleColumn = !('numColumns' in props) || props.numColumns === 1

    return (
        <RNGHFlatList
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
