import { View as RNView, ViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const View = copyComponentProperties(RNView, (props: ViewProps) => {
    const style = useStyle(props.className, props)

    return (
        <RNView
            {...props}
            style={[style, props.style]}
        />
    )
})

export default View
