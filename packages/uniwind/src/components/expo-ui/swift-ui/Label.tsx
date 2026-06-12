import { Label as ExpoLabel, type LabelProps } from '@expo/ui/swift-ui'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const Label = copyComponentProperties(ExpoLabel, (props: LabelProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoLabel
            {...props}
            color={props.color ?? color}
        />
    )
})
