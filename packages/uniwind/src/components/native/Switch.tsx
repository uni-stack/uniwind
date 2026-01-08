import { Switch as RNSwitch, SwitchProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const Switch = copyComponentProperties(RNSwitch, (props: SwitchProps) => {
    const state = {
        isDisabled: Boolean(props.disabled),
    } satisfies ComponentState
    const style = useStyle(props.className, props, state)
    const trackColorOn = useStyle(props.trackColorOnClassName, props, state).accentColor
    const trackColorOff = useStyle(props.trackColorOffClassName, props, state).accentColor
    const thumbColor = useStyle(props.thumbColorClassName, props, state).accentColor
    const ios_backgroundColor = useStyle(props.ios_backgroundColorClassName, props, state).accentColor

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
