import { Svg as RNSvg, SvgProps } from 'react-native-svg'
import { copyComponentProperties } from '../../utils'
import { toRNWClassName } from '../../web/rnw'

export const Svg = copyComponentProperties(RNSvg, (props: SvgProps) => {
    return (
        <RNSvg
            {...props}
            style={[toRNWClassName(props.className), props.style]}
        />
    )
})

export default Svg
