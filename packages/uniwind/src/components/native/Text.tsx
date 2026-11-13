import { useState } from 'react'
import type { TextProps } from 'react-native'
import { Text as RNText } from 'react-native'
import type { ComponentState } from '../../core/types'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

type TextOnlyStyle = {
    WebkitLineClamp?: number
    lineBreak?: string
    wordBreak?: string
}

// Supported from RN 0.89+ and Android 13+, RN logs any other value as unsupported
const LINE_BREAKS = ['auto', 'loose', 'normal', 'strict']
const WORD_BREAKS = ['normal', 'auto-phrase']

const toLineBreakProps = ({ lineBreak, wordBreak }: TextOnlyStyle) => ({
    ...(lineBreak !== undefined && LINE_BREAKS.includes(lineBreak) && { lineBreak }),
    ...(wordBreak !== undefined && WORD_BREAKS.includes(wordBreak) && { wordBreak }),
})

export const Text = copyComponentProperties(RNText, (props: TextProps) => {
    const [isPressed, setIsPressed] = useState(false)
    const state = {
        isPressed,
        isDisabled: Boolean(props.disabled),
    } satisfies ComponentState
    const style = useStyle(props.className, props, state)
    const selectionColor = useAccentColor(props.selectionColorClassName, props, state)

    return (
        <RNText
            {...toLineBreakProps(style as TextOnlyStyle)}
            {...props}
            style={[style, props.style]}
            selectionColor={props.selectionColor ?? selectionColor}
            numberOfLines={(style as TextOnlyStyle).WebkitLineClamp ?? props.numberOfLines}
            onPressIn={event => {
                setIsPressed(true)
                props.onPressIn?.(event)
            }}
            onPressOut={event => {
                setIsPressed(false)
                props.onPressOut?.(event)
            }}
        />
    )
})

export default Text
