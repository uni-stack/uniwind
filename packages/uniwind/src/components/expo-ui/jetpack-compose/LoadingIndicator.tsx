import {
    ContainedLoadingIndicator as ExpoContainedLoadingIndicator,
    type ContainedLoadingIndicatorProps,
    LoadingIndicator as ExpoLoadingIndicator,
    type LoadingIndicatorCommonConfig,
} from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

type LoadingIndicatorProps = LoadingIndicatorCommonConfig & {
    colorClassName?: string
}

export const LoadingIndicator = copyComponentProperties(ExpoLoadingIndicator, (props: LoadingIndicatorProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoLoadingIndicator
            {...props}
            color={props.color ?? color}
        />
    )
})

export const ContainedLoadingIndicator = copyComponentProperties(
    ExpoContainedLoadingIndicator,
    (props: ContainedLoadingIndicatorProps) => {
        const color = useAccentColor(props.colorClassName, props)
        const containerColor = useAccentColor(props.containerColorClassName, props)

        return (
            <ExpoContainedLoadingIndicator
                {...props}
                color={props.color ?? color}
                containerColor={props.containerColor ?? containerColor}
            />
        )
    },
)
