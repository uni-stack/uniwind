import { SwitchProps } from 'react-native'
import { Switch as RNGHSwitch } from 'react-native-gesture-handler'
import { ComponentState } from '../../../core/types'
import { useUniwindAccent } from '../../../hooks/useUniwindAccent.native'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const Switch = copyComponentProperties(RNGHSwitch, (props: SwitchProps) => {
    const state = {
        isDisabled: Boolean(props.disabled),
    } satisfies ComponentState
    const style = useStyle(props.className, state)
    const trackColorOn = useUniwindAccent(props.trackColorOnClassName, state)
    const trackColorOff = useUniwindAccent(props.trackColorOffClassName, state)
    const thumbColor = useUniwindAccent(props.thumbColorClassName, state)
    const ios_backgroundColor = useUniwindAccent(props.ios_backgroundColorClassName, state)

    return (
        <RNGHSwitch
            {...props}
            style={[style, props.style]}
            thumbColor={props.thumbColor ?? thumbColor}
            trackColor={{ true: props.trackColor?.true ?? trackColorOn, false: props.trackColor?.false ?? trackColorOff }}
            ios_backgroundColor={props.ios_backgroundColor ?? ios_backgroundColor}
        />
    )
})

export default Switch
