import { SecureField as ExpoSecureField, type SecureFieldProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const SecureField = copyComponentProperties(ExpoSecureField, (props: SecureFieldProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoSecureField
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
