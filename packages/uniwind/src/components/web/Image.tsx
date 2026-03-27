import { Image as RNImage, ImageProps } from 'react-native'
import { useResolveClassNames } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'
import { useUniwindAccent } from './useUniwindAccent'

export const Image = copyComponentProperties(RNImage, (props: ImageProps) => {
    const tintColor = useUniwindAccent(props.tintColorClassName)
    const styles = useResolveClassNames(props.className ?? '')
    const isUsingWidth = styles.width !== undefined
    const isUsingHeight = styles.height !== undefined
    const styleReset = {
        width: isUsingWidth ? '' : undefined,
        height: isUsingHeight ? '' : undefined,
    }

    return (
        <RNImage
            {...props}
            style={[toRNWClassName(props.className), styleReset, props.style]}
            tintColor={props.tintColor ?? tintColor}
            dataSet={generateDataSet(props)}
        />
    )
})

export default Image
