import {
    ScrollViewProps,
    ScrollViewPropsAndroid,
    ScrollViewPropsIOS,
    Touchable,
    VirtualizedListProps,
} from 'react-native'

declare module '@react-native/virtualized-lists' {
    export interface VirtualizedListWithoutRenderItemProps<ItemT> extends ScrollViewProps {
        ListFooterComponentClassName?: string
        ListHeaderComponentClassName?: string
    }
}

declare module 'react-native' {
    interface FlatListProps<ItemT> extends VirtualizedListProps<ItemT> {
        columnWrapperClassName?: string
        contentContainerClassName?: string
    }

    interface ImageBackgroundProps extends ImagePropsBase {
        imageClassName?: string
        tintColorClassName?: string
    }

    interface ImagePropsBase {
        className?: string
        tintColorClassName?: string
    }

    interface InputAccessoryViewProps {
        className?: string
    }

    interface KeyboardAvoidingViewProps extends ViewProps {
        contentContainerClassName?: string
    }

    interface ScrollViewProps extends ViewProps, ScrollViewPropsIOS, ScrollViewPropsAndroid, Touchable {
        contentContainerClassName?: string
        endFillColorClassName?: string
    }

    interface SectionListProps<ItemT> extends VirtualizedListProps<ItemT> {
        contentContainerClassName?: string
    }

    interface SwitchProps {
        className?: never
        ios_backgroundColorClassName?: string
        thumbColorClassName?: string
        trackColorOnClassName?: string
        trackColorOffClassName?: string
    }

    interface TextProps {
        className?: string
        selectionColorClassName?: string
    }

    interface TouchableWithoutFeedbackProps {
        className?: string
    }

    interface ViewProps {
        className?: string
    }

    interface PressableProps {
        className?: string
    }

    interface TextInputProps {
        className?: string
        cursorColorClassName?: string
        underlineColorAndroidClassName?: string
        placeholderTextColorClassName?: string
        selectionColorClassName?: string
        selectionHandleColorClassName?: string
    }

    interface RefreshControlProps {
        colorsClassName?: string
        progressBackgroundColorClassName?: string
        tintColorClassName?: string
        titleColorClassName?: string
    }

    interface TouchableHighlightProps {
        underlayColorClassName?: string
    }

    interface ActivityIndicatorProps {
        colorClassName?: string
    }

    interface ModalBaseProps {
        backdropColorClassName?: string
    }

    interface ButtonProps {
        colorClassName?: string
    }

    interface InputAccessoryViewProps {
        backgroundColorClassName?: string
    }
}

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
