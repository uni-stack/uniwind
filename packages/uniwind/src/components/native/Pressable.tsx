import { Pressable as RNPressable, PressableProps } from 'react-native'
import { useUniwindContext } from '../../core/context'
import { UniwindStore } from '../../core/native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const Pressable = copyComponentProperties(RNPressable, (props: PressableProps) => {
    const style = useStyle(
        props.className,
        props,
        {
            isDisabled: Boolean(props.disabled),
        },
    )
    const uniwindContext = useUniwindContext()

    return (
        <RNPressable
            {...props}
            style={state => {
                if (state.pressed) {
                    return [
                        UniwindStore.getStyles(
                            props.className,
                            props,
                            { isDisabled: Boolean(props.disabled), isPressed: true },
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
