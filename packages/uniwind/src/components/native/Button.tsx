import { Button as RNButton, ButtonProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const Button = copyComponentProperties(RNButton, (props: ButtonProps) => {
    const color = useStyle(props.colorClassName, props).accentColor

    return (
        <RNButton
            {...props}
            color={props.color ?? color}
        />
    )
})

export default Button
