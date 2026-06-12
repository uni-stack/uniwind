import { Icon as ExpoIcon, type IconProps } from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const Icon = copyComponentProperties(ExpoIcon, (props: IconProps) => {
    const tint = useAccentColor(props.tintClassName, props)

    return (
        <ExpoIcon
            {...props}
            tint={props.tint ?? tint}
        />
    )
})
