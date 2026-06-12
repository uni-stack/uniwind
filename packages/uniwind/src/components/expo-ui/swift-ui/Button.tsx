import { Button as ExpoButton, type ButtonProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const Button = copyComponentProperties(ExpoButton, (props: ButtonProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoButton
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
