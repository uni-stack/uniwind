import { ColorPicker as ExpoColorPicker, type ColorPickerProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const ColorPicker = copyComponentProperties(ExpoColorPicker, (props: ColorPickerProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoColorPicker
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
