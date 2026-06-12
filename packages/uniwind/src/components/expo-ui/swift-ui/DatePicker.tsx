import { DatePicker as ExpoDatePicker, type DatePickerProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const DatePicker = copyComponentProperties(ExpoDatePicker, (props: DatePickerProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoDatePicker
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
