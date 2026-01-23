import { Switch as RNSwitch, SwitchProps } from 'react-native'
import { ComponentState } from '../../core/types'
import { useUniwindAccent } from '../../hooks/useUniwindAccent.native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const Switch = copyComponentProperties(RNSwitch, (props: SwitchProps) => {
    const state = {
        isDisabled: Boolean(props.disabled),
        isFocused: Boolean(props.value),
    } satisfies ComponentState
    const { Component, style } = useStyle(RNSwitch, props.className, state)
    const trackColorOn = useUniwindAccent(props.trackColorOnClassName, state)
    const trackColorOff = useUniwindAccent(props.trackColorOffClassName, state)
    const thumbColor = useUniwindAccent(props.thumbColorClassName, state)
    const ios_backgroundColor = useUniwindAccent(props.ios_backgroundColorClassName, state)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            thumbColor={props.thumbColor ?? thumbColor}
            trackColor={{ true: props.trackColor?.true ?? trackColorOn, false: props.trackColor?.false ?? trackColorOff }}
            ios_backgroundColor={props.ios_backgroundColor ?? ios_backgroundColor}
        />
    )
})

export default Switch
