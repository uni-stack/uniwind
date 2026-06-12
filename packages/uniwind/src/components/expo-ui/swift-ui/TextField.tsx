import { TextField as ExpoTextField, type TextFieldProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const TextField = copyComponentProperties(ExpoTextField, (props: TextFieldProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoTextField
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
