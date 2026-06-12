import { SyncToggle as ExpoSyncToggle, type SyncToggleProps } from '@expo/ui/swift-ui'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'
import { addModifiersFromStyle } from '../modifiers-utils'

export const SyncToggle = copyComponentProperties(ExpoSyncToggle, (props: SyncToggleProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoSyncToggle
            {...props}
            modifiers={addModifiersFromStyle(style, props.modifiers)}
        />
    )
})
