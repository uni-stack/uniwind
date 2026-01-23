import { useReducer } from 'react'
import { Pressable as RNPressable, PressableProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const Pressable = copyComponentProperties(RNPressable, (props: PressableProps) => {
    const [isPressed, setIsPressed] = useReducer((state: boolean) => !state, false)
    const { Component, style } = useStyle(RNPressable, props.className, {
        isDisabled: Boolean(props.disabled),
        isPressed,
    })

    return (
        <Component
            {...props}
            style={[
                style,
                typeof props.style === 'function' ? props.style({ pressed: isPressed }) : props.style,
            ]}
            onPressIn={event => {
                setIsPressed()
                props.onPressIn?.(event)
            }}
            onPressOut={event => {
                setIsPressed()
                props.onPressOut?.(event)
            }}
        />
    )
})

export default Pressable
