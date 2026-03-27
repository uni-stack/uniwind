import { ImageBackground as RNImageBackground, ImageBackgroundProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const ImageBackground = copyComponentProperties(RNImageBackground, (props: ImageBackgroundProps) => {
    const style = useStyle(props.className, props)
    const imageStyle = useStyle(props.imageClassName, props)
    const tintColor = useAccentColor(props.tintColorClassName, props)

    return (
        <RNImageBackground
            {...props}
            style={[style, props.style]}
            imageStyle={[imageStyle, props.imageStyle]}
            tintColor={props.tintColor ?? tintColor}
        />
    )
})

export default ImageBackground
