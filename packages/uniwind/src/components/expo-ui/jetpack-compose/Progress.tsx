import {
    CircularProgressIndicator as ExpoCircularProgressIndicator,
    type CircularProgressIndicatorProps,
    LinearProgressIndicator as ExpoLinearProgressIndicator,
    type LinearProgressIndicatorProps,
    LinearWavyProgressIndicator as ExpoLinearWavyProgressIndicator,
    type LinearWavyProgressIndicatorProps,
} from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const LinearProgressIndicator = copyComponentProperties(
    ExpoLinearProgressIndicator,
    (props: LinearProgressIndicatorProps) => {
        const color = useAccentColor(props.colorClassName, props)
        const trackColor = useAccentColor(props.trackColorClassName, props)

        return (
            <ExpoLinearProgressIndicator
                {...props}
                color={props.color ?? color}
                trackColor={props.trackColor ?? trackColor}
            />
        )
    },
)

export const CircularProgressIndicator = copyComponentProperties(
    ExpoCircularProgressIndicator,
    (props: CircularProgressIndicatorProps) => {
        const color = useAccentColor(props.colorClassName, props)
        const trackColor = useAccentColor(props.trackColorClassName, props)

        return (
            <ExpoCircularProgressIndicator
                {...props}
                color={props.color ?? color}
                trackColor={props.trackColor ?? trackColor}
            />
        )
    },
)

export const LinearWavyProgressIndicator = copyComponentProperties(
    ExpoLinearWavyProgressIndicator,
    (props: LinearWavyProgressIndicatorProps) => {
        const color = useAccentColor(props.colorClassName, props)
        const trackColor = useAccentColor(props.trackColorClassName, props)

        return (
            <ExpoLinearWavyProgressIndicator
                {...props}
                color={props.color ?? color}
                trackColor={props.trackColor ?? trackColor}
            />
        )
    },
)
