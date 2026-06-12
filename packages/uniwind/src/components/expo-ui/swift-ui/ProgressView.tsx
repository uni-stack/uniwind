import { ProgressView as ExpoProgressView, type ProgressViewProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const ProgressView = copyComponentProperties(ExpoProgressView, (props: ProgressViewProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoProgressView
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
