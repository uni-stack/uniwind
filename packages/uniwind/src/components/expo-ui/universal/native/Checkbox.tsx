import type { CheckboxProps } from '@expo/ui'
import { Checkbox as ExpoCheckbox } from '@expo/ui'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'
import { addModifiersFromStyle } from '../../modifiers-utils'

export const Checkbox = copyComponentProperties(ExpoCheckbox, (props: CheckboxProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })

    return (
        <ExpoCheckbox
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
