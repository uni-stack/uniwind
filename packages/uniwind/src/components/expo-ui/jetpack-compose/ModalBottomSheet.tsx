import { ModalBottomSheet as ExpoModalBottomSheet, type ModalBottomSheetProps } from '@expo/ui/jetpack-compose'
import type { ComponentType, ReactNode } from 'react'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

type UniwindModalBottomSheet = ComponentType<ModalBottomSheetProps> & {
    DragHandle: ComponentType<{ children: ReactNode }>
}

export const ModalBottomSheet: UniwindModalBottomSheet = copyComponentProperties(ExpoModalBottomSheet, (props: ModalBottomSheetProps) => {
    const containerColor = useAccentColor(props.containerColorClassName, props)
    const contentColor = useAccentColor(props.contentColorClassName, props)
    const scrimColor = useAccentColor(props.scrimColorClassName, props)

    return (
        <ExpoModalBottomSheet
            {...props}
            containerColor={props.containerColor ?? containerColor}
            contentColor={props.contentColor ?? contentColor}
            scrimColor={props.scrimColor ?? scrimColor}
        />
    )
})
