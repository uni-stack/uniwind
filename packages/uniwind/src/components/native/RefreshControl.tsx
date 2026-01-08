import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const RefreshControl = copyComponentProperties(RNRefreshControl, (props: RefreshControlProps) => {
    const style = useStyle(props.className, props)
    const color = useStyle(props.colorsClassName, props).accentColor
    const tintColor = useStyle(props.tintColorClassName, props).accentColor
    const titleColor = useStyle(props.titleColorClassName, props).accentColor
    const progressBackgroundColor = useStyle(props.progressBackgroundColorClassName, props).accentColor

    return (
        <RNRefreshControl
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
