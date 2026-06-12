import { Gauge as ExpoGauge, type GaugeProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const Gauge = copyComponentProperties(ExpoGauge, (props: GaugeProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoGauge
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
