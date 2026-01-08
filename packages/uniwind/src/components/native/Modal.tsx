import { Modal as RNModal, ModalProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const Modal = copyComponentProperties(RNModal, (props: ModalProps) => {
    const style = useStyle(props.className, props)
    const backdropColor = useStyle(props.backdropColorClassName, props).accentColor

    return (
        <RNModal
            {...props}
            style={[style, props.style]}
            backdropColor={props.backdropColor ?? backdropColor}
        />
    )
})

export default Modal
