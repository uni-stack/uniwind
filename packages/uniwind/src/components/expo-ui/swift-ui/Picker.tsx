import { Picker as ExpoPicker, type PickerProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const Picker = copyComponentProperties(ExpoPicker, (props: PickerProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoPicker
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
