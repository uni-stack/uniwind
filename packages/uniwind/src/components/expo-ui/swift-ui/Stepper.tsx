import { Stepper as ExpoStepper, type StepperProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const Stepper = copyComponentProperties(ExpoStepper, (props: StepperProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoStepper
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
