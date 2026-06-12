import { Switch as ExpoSwitch, type SwitchProps } from '@expo/ui'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'
import { addModifiersFromStyle } from '../../modifiers-utils'

export const Switch = copyComponentProperties(ExpoSwitch, (props: SwitchProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })

    return (
        <ExpoSwitch
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
