import { Switch as RNSwitch, SwitchProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const Switch = copyComponentProperties(RNSwitch, (props: SwitchProps) => {
    const state = {
        isDisabled: Boolean(props.disabled),
    } satisfies ComponentState
    const style = useStyle(props.className, props, state)
    const trackColorOn = useAccentColor(props.trackColorOnClassName, props, state)
    const trackColorOff = useAccentColor(props.trackColorOffClassName, props, state)
    const thumbColor = useAccentColor(props.thumbColorClassName, props, state)
    const ios_backgroundColor = useAccentColor(props.ios_backgroundColorClassName, props, state)

    return (
        <RNSwitch
            {...props}
            style={[style, props.style]}
            thumbColor={props.thumbColor ?? thumbColor}
            trackColor={{ true: props.trackColor?.true ?? trackColorOn, false: props.trackColor?.false ?? trackColorOff }}
            ios_backgroundColor={props.ios_backgroundColor ?? ios_backgroundColor}
        />
    )
})

export default Switch
