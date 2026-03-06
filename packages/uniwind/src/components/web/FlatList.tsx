import { FlatList as RNFlatList, FlatListProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const FlatList = copyComponentProperties(RNFlatList, (props: FlatListProps<unknown>) => {
    const hasSingleColumn = !('numColumns' in props) || props.numColumns === 1

    return (
        <RNFlatList
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            columnWrapperStyle={hasSingleColumn ? undefined : [toRNWClassName(props.columnWrapperClassName), props.columnWrapperStyle]}
            contentContainerStyle={[toRNWClassName(props.contentContainerClassName), props.contentContainerStyle]}
            ListFooterComponentStyle={[toRNWClassName(props.ListFooterComponentClassName), props.ListFooterComponentStyle]}
            ListHeaderComponentStyle={[toRNWClassName(props.ListHeaderComponentClassName), props.ListHeaderComponentStyle]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default FlatList
