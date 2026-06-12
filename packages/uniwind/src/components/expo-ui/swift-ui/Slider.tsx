import { Slider as ExpoSlider, type SliderProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const Slider = copyComponentProperties(ExpoSlider, (props: SliderProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoSlider
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
