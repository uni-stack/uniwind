import { RefreshControlProps } from 'react-native'
import { RefreshControl as RNGHRefreshControl } from 'react-native-gesture-handler'
import { useUniwindAccent } from '../../../hooks'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const RefreshControl = copyComponentProperties(RNGHRefreshControl, (props: RefreshControlProps) => {
    const style = useStyle(props.className)
    const color = useUniwindAccent(props.colorsClassName)
    const tintColor = useUniwindAccent(props.tintColorClassName)
    const titleColor = useUniwindAccent(props.titleColorClassName)
    const progressBackgroundColor = useUniwindAccent(props.progressBackgroundColorClassName)

    return (
        <RNGHRefreshControl
            {...props}
            style={[style, props.style]}
            colors={props.colors ?? (color !== undefined ? [color] : undefined)}
            tintColor={props.tintColor ?? tintColor}
            titleColor={props.titleColor ?? titleColor}
            progressBackgroundColor={props.progressBackgroundColor ?? progressBackgroundColor}
        />
    )
})

export default RefreshControl
