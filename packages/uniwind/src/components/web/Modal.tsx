import type { ModalProps } from 'react-native'
import { Modal as RNModal } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const Modal = copyComponentProperties(RNModal, (props: ModalProps) => {
    return (
        <RNModal
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default Modal
