import { ImageBackground as RNImageBackground, ImageBackgroundProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const ImageBackground = copyComponentProperties(RNImageBackground, (props: ImageBackgroundProps) => {
    const style = useStyle(props.className, props)
    const imageStyle = useStyle(props.imageClassName, props)
    const tintColor = useStyle(props.tintColorClassName, props).accentColor

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
