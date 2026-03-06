import { Switch as RNSwitch, SwitchProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const Switch = copyComponentProperties(RNSwitch, (props: SwitchProps) => {
    const trackColorOn = useUniwindAccent(props.trackColorOnClassName)
    const trackColorOff = useUniwindAccent(props.trackColorOffClassName)
    const thumbColor = useUniwindAccent(props.thumbColorClassName)

    return (
        <RNSwitch
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            thumbColor={props.thumbColor ?? thumbColor}
            trackColor={{ true: props.trackColor?.true ?? trackColorOn, false: props.trackColor?.false ?? trackColorOff }}
            dataSet={generateDataSet(props)}
        />
    )
})

export default Switch
