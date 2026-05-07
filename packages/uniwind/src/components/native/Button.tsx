import type { ButtonProps } from 'react-native'
import { Button as RNButton } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'

export const Button = copyComponentProperties(RNButton, (props: ButtonProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return (
        <RNButton
            {...props}
            color={props.color ?? color}
        />
    )
})

export default Button
