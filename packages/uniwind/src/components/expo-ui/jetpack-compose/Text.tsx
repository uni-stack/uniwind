import { Text as ExpoText, type TextProps } from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const Text = copyComponentProperties(ExpoText, (props: TextProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoText
            {...props}
            color={props.color ?? color}
        />
    )
})
