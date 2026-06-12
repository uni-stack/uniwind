import { Surface as ExpoSurface, type SurfaceProps } from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const Surface = copyComponentProperties(ExpoSurface, (props: SurfaceProps) => {
    const color = useAccentColor(props.colorClassName, props)
    const contentColor = useAccentColor(props.contentColorClassName, props)

    return (
        <ExpoSurface
            {...props}
            color={props.color ?? color}
            contentColor={props.contentColor ?? contentColor}
        />
    )
})
