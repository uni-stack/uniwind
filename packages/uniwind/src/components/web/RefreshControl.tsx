import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const RefreshControl = copyComponentProperties(RNRefreshControl, (props: RefreshControlProps) => {
    return (
        <RNRefreshControl
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default RefreshControl
