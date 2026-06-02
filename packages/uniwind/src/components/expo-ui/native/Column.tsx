import { Column as ExpoColumn, type ColumnProps } from '@expo/ui'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

const alignmentByAlignItems: Record<string, NonNullable<ColumnProps['alignment']>> = {
    'flex-start': 'start',
    center: 'center',
    'flex-end': 'end',
}

export const Column = copyComponentProperties(ExpoColumn, (props: ColumnProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })
    const alignment = typeof style.alignItems === 'string' ? alignmentByAlignItems[style.alignItems] : undefined

    return (
        <ExpoColumn
            {...props}
            alignment={props.alignment ?? alignment}
            spacing={props.spacing ?? (typeof style.gap === 'number' ? style.gap : undefined)}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
