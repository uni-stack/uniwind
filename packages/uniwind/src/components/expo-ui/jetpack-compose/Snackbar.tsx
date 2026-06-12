import { Snackbar as ExpoSnackbar, type SnackbarProps } from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const Snackbar = copyComponentProperties(ExpoSnackbar, (props: SnackbarProps) => {
    const containerColor = useAccentColor(props.containerColorClassName, props)
    const contentColor = useAccentColor(props.contentColorClassName, props)
    const actionContentColor = useAccentColor(props.actionContentColorClassName, props)
    const dismissActionContentColor = useAccentColor(props.dismissActionContentColorClassName, props)

    return (
        <ExpoSnackbar
            {...props}
            actionContentColor={props.actionContentColor ?? actionContentColor}
            containerColor={props.containerColor ?? containerColor}
            contentColor={props.contentColor ?? contentColor}
            dismissActionContentColor={props.dismissActionContentColor ?? dismissActionContentColor}
        />
    )
})
