import { Image as RNImage, ImageProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const Image = copyComponentProperties(RNImage, (props: ImageProps) => {
    const style = useStyle(props.className, props, undefined, 'Image')
    const tintColor = useAccentColor(props.tintColorClassName, props)

    return (
        <RNImage
            {...props}
            style={[style, props.style]}
            tintColor={props.tintColor ?? tintColor}
        />
    )
})

export default Image
