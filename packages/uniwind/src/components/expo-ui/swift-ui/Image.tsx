import { Image as ExpoImage, type ImageProps } from '@expo/ui/swift-ui'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const Image = copyComponentProperties(ExpoImage, (props: ImageProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoImage
            {...props}
            color={props.color ?? color}
        />
    )
})
