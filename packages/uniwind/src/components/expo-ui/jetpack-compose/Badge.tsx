import { Badge as ExpoBadge, type BadgeProps } from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const Badge = copyComponentProperties(ExpoBadge, (props: BadgeProps) => {
    const containerColor = useAccentColor(props.containerColorClassName, props)
    const contentColor = useAccentColor(props.contentColorClassName, props)

    return (
        <ExpoBadge
            {...props}
            containerColor={props.containerColor ?? containerColor}
            contentColor={props.contentColor ?? contentColor}
        />
    )
})
