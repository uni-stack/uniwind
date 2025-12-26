import { Svg as RNSvg, SvgProps } from 'react-native-svg'
import { copyComponentProperties } from '../../utils'
import { useStyle } from '../useStyle'

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
