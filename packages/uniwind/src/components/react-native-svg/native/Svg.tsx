import { Svg as RNSvg, SvgProps } from 'react-native-svg'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const Svg = copyComponentProperties(RNSvg, (props: SvgProps) => {
    const style = useStyle(props.className)

    return (
        <RNSvg
            {...props}
            style={[style, props.style]}
        />
    )
})

export default Svg
