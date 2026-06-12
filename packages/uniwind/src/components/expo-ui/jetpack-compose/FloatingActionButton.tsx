import {
    ExtendedFloatingActionButton as ExpoExtendedFloatingActionButton,
    type ExtendedFloatingActionButtonProps,
    FloatingActionButton as ExpoFloatingActionButton,
    type FloatingActionButtonProps,
    LargeFloatingActionButton as ExpoLargeFloatingActionButton,
    type LargeFloatingActionButtonProps,
    SmallFloatingActionButton as ExpoSmallFloatingActionButton,
    type SmallFloatingActionButtonProps,
} from '@expo/ui/jetpack-compose'
import type { ComponentType, ReactNode } from 'react'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

type IconSlot = {
    Icon: ComponentType<{ children: ReactNode }>
}

type TextSlot = {
    Text: ComponentType<{ children: ReactNode }>
}

export const SmallFloatingActionButton: ComponentType<SmallFloatingActionButtonProps> & IconSlot = copyComponentProperties(
    ExpoSmallFloatingActionButton,
    (props: SmallFloatingActionButtonProps) => {
        const containerColor = useAccentColor(props.containerColorClassName, props)

        return (
            <ExpoSmallFloatingActionButton
                {...props}
                containerColor={props.containerColor ?? containerColor}
            />
        )
    },
)

export const FloatingActionButton: ComponentType<FloatingActionButtonProps> & IconSlot = copyComponentProperties(
    ExpoFloatingActionButton,
    (props: FloatingActionButtonProps) => {
        const containerColor = useAccentColor(props.containerColorClassName, props)

        return (
            <ExpoFloatingActionButton
                {...props}
                containerColor={props.containerColor ?? containerColor}
            />
        )
    },
)

export const LargeFloatingActionButton: ComponentType<LargeFloatingActionButtonProps> & IconSlot = copyComponentProperties(
    ExpoLargeFloatingActionButton,
    (props: LargeFloatingActionButtonProps) => {
        const containerColor = useAccentColor(props.containerColorClassName, props)

        return (
            <ExpoLargeFloatingActionButton
                {...props}
                containerColor={props.containerColor ?? containerColor}
            />
        )
    },
)

export const ExtendedFloatingActionButton: ComponentType<ExtendedFloatingActionButtonProps> & IconSlot & TextSlot = copyComponentProperties(
    ExpoExtendedFloatingActionButton,
    (props: ExtendedFloatingActionButtonProps) => {
        const containerColor = useAccentColor(props.containerColorClassName, props)

        return (
            <ExpoExtendedFloatingActionButton
                {...props}
                containerColor={props.containerColor ?? containerColor}
            />
        )
    },
)
