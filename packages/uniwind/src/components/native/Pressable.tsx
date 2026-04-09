import { Pressable as RNPressable, PressableProps } from 'react-native'
import { useUniwindContext } from '../../core/context'
import { UniwindStore } from '../../core/native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

declare module 'react-native' {
    interface PressableStateCallbackType {
        focused?: boolean
    }
}

export const Pressable = copyComponentProperties(RNPressable, (props: PressableProps) => {
    const style = useStyle(
        props.className,
        props,
        {
            isDisabled: Boolean(props.disabled),
        },
        'Pressable',
    )
    const uniwindContext = useUniwindContext()

    return (
        <RNPressable
            {...props}
            style={state => {
                if (state.pressed || state.focused) {
                    return [
                        UniwindStore.getStyles(
                            props.className !== undefined ? `uniwind-default-Pressable ${props.className}` : 'uniwind-default-Pressable',
                            props,
                            { isDisabled: Boolean(props.disabled), isPressed: state.pressed, isFocused: state.focused },
                            uniwindContext,
                        ).styles,
                        typeof props.style === 'function' ? props.style(state) : props.style,
                    ]
                }

                return [style, typeof props.style === 'function' ? props.style(state) : props.style]
            }}
        />
    )
})

export default Pressable
