declare module '@expo/ui' {
    interface UniversalBaseProps {
        className?: string
    }

    interface TextInputProps {
        className?: string
        cursorColorClassName?: string
        placeholderTextColorClassName?: string
        selectionColorClassName?: string
        selectionHandleColorClassName?: string
    }

    interface IconProps {
        colorClassName?: string
    }

    interface CheckboxProps {
        className?: string
    }

    interface SliderProps {
        className?: string
    }

    interface SwitchProps {
        className?: string
    }
}

declare module '@expo/ui/swift-ui' {
    interface CommonViewModifierProps {
        className?: string
        colorClassName?: string
    }

    interface ImageProps {
        colorClassName?: string
    }
}

declare module '@expo/ui/jetpack-compose' {
    interface BadgeProps {
        containerColorClassName?: string
        contentColorClassName?: string
    }

    interface DateTimePickerProps {
        colorClassName?: string
    }

    interface DatePickerDialogProps {
        colorClassName?: string
    }

    interface TimePickerDialogProps {
        colorClassName?: string
    }

    interface DropdownMenuProps {
        className?: string
        colorClassName?: string
    }

    interface FloatingActionButtonProps {
        containerColorClassName?: string
    }

    interface HostProps {
        className?: string
    }

    interface IconProps {
        tintClassName?: string
    }

    interface ContainedLoadingIndicatorProps {
        colorClassName?: string
        containerColorClassName?: string
    }

    interface ModalBottomSheetProps {
        containerColorClassName?: string
        contentColorClassName?: string
        scrimColorClassName?: string
    }

    interface LinearProgressIndicatorProps {
        colorClassName?: string
        trackColorClassName?: string
    }

    interface CircularProgressIndicatorProps {
        colorClassName?: string
        trackColorClassName?: string
    }

    interface LinearWavyProgressIndicatorProps {
        colorClassName?: string
        trackColorClassName?: string
    }

    interface ShapeProps {
        colorClassName?: string
    }

    interface SnackbarProps {
        actionContentColorClassName?: string
        containerColorClassName?: string
        contentColorClassName?: string
        dismissActionContentColorClassName?: string
    }

    interface SurfaceProps {
        colorClassName?: string
        contentColorClassName?: string
    }

    interface TextProps {
        colorClassName?: string
    }
}

export {}
