import { Modal as RNModal, ModalProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const Modal = copyComponentProperties(RNModal, (props: ModalProps) => {
    const style = useStyle(props.className, props, undefined, 'Modal')
    const backdropColor = useAccentColor(props.backdropColorClassName, props)

    return (
        <RNModal
            {...props}
            style={[style, props.style]}
            backdropColor={props.backdropColor ?? backdropColor}
        />
    )
})

export default Modal
