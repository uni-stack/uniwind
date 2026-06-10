import {
    FieldGroup as ExpoFieldGroup,
    type FieldGroupProps,
    type FieldSectionFooterProps,
    type FieldSectionHeaderProps,
    type FieldSectionProps,
} from '@expo/ui'
import type { ComponentType } from 'react'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'

type UniwindFieldGroup = ComponentType<FieldGroupProps> & {
    Section: ComponentType<FieldSectionProps>
    SectionHeader: ComponentType<FieldSectionHeaderProps>
    SectionFooter: ComponentType<FieldSectionFooterProps>
}

const FieldGroupBase = (props: FieldGroupProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })

    return (
        <ExpoFieldGroup
            {...props}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
}

copyComponentProperties(ExpoFieldGroup, FieldGroupBase)

const FieldGroupSection = (props: FieldSectionProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })

    return (
        <ExpoFieldGroup.Section
            {...props}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
}

copyComponentProperties(ExpoFieldGroup.Section, FieldGroupSection)

const FieldGroup = FieldGroupBase as UniwindFieldGroup

FieldGroup.Section = FieldGroupSection
FieldGroup.SectionHeader = ExpoFieldGroup.SectionHeader
FieldGroup.SectionFooter = ExpoFieldGroup.SectionFooter

export { FieldGroup }
