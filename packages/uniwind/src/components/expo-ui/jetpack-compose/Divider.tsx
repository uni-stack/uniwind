import {
    type DividerCommonConfig,
    HorizontalDivider as ExpoHorizontalDivider,
    VerticalDivider as ExpoVerticalDivider,
} from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

type DividerProps = DividerCommonConfig & {
    colorClassName?: string
}

export const HorizontalDivider = copyComponentProperties(ExpoHorizontalDivider, (props: DividerProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoHorizontalDivider
            {...props}
            color={props.color ?? color}
        />
    )
})

export const VerticalDivider = copyComponentProperties(ExpoVerticalDivider, (props: DividerProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoVerticalDivider
            {...props}
            color={props.color ?? color}
        />
    )
})
