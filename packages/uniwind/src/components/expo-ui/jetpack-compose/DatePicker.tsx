import {
    DatePickerDialog as ExpoDatePickerDialog,
    type DatePickerDialogProps,
    DateTimePicker as ExpoDateTimePicker,
    type DateTimePickerProps,
    TimePickerDialog as ExpoTimePickerDialog,
    type TimePickerDialogProps,
} from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

export const DateTimePicker = copyComponentProperties(ExpoDateTimePicker, (props: DateTimePickerProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoDateTimePicker
            {...props}
            color={props.color ?? color}
        />
    )
})

export const DatePickerDialog = copyComponentProperties(ExpoDatePickerDialog, (props: DatePickerDialogProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoDatePickerDialog
            {...props}
            color={props.color ?? color}
        />
    )
})

export const TimePickerDialog = copyComponentProperties(ExpoTimePickerDialog, (props: TimePickerDialogProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoTimePickerDialog
            {...props}
            color={props.color ?? color}
        />
    )
})
