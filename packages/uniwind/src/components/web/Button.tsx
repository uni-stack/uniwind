import { Button as RNButton, ButtonProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { useUniwindAccent } from './useUniwindAccent'

export const Button = copyComponentProperties(RNButton, (props: ButtonProps) => {
    const color = useUniwindAccent(props.colorClassName)

    return (
        <RNButton
            {...props}
            color={props.color ?? color}
            dataSet={generateDataSet(props)}
        />
    )
})

export default Button
