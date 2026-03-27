import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const RefreshControl = copyComponentProperties(RNRefreshControl, (props: RefreshControlProps) => {
    const style = useStyle(props.className, props)
    const color = useAccentColor(props.colorsClassName, props)
    const tintColor = useAccentColor(props.tintColorClassName, props)
    const titleColor = useAccentColor(props.titleColorClassName, props)
    const progressBackgroundColor = useAccentColor(props.progressBackgroundColorClassName, props)

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
