import { Image as RNImage, ImageProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const Image = copyComponentProperties(RNImage, (props: ImageProps) => {
    const style = useStyle(props.className, props)
    const tintColor = useStyle(props.tintColorClassName, props).accentColor

    return (
        <RNImage
            {...props}
            style={[style, props.style]}
            tintColor={props.tintColor ?? tintColor}
        />
    )
})

export default Image
