import type { PressableProps } from 'react-native'
import { Pressable as RNPressable } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const Pressable = copyComponentProperties(RNPressable, (props: PressableProps) => {
    return (
        <RNPressable
            {...props}
            style={state => [toRNWClassName(props.className), typeof props.style === 'function' ? props.style(state) : props.style]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default Pressable
