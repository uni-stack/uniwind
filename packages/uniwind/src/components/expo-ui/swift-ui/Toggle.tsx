import { Toggle as ExpoToggle, type ToggleProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const Toggle = copyComponentProperties(ExpoToggle, (props: ToggleProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoToggle
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
