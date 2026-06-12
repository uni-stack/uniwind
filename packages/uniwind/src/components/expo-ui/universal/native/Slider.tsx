import type { SliderProps } from '@expo/ui'
import { Slider as ExpoSlider } from '@expo/ui'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'
import { addModifiersFromStyle } from '../../modifiers-utils'

export const Slider = copyComponentProperties(ExpoSlider, (props: SliderProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })

    return (
        <ExpoSlider
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
