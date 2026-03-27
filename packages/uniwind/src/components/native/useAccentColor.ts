import { isDefined } from '../../common/utils'
import { Logger } from '../../core/logger'
import { ComponentState } from '../../core/types'
import { useStyle } from './useStyle'

let warnedOnce = false

export const useAccentColor = (className: string | undefined, componentProps: Record<string, any>, state?: ComponentState) => {
    const styles = useStyle(className, componentProps, state)

    if (__DEV__ && !warnedOnce && isDefined(className) && className.trim() !== '' && styles.accentColor === undefined) {
        warnedOnce = true
        Logger.warn(
            `className '${className}' was provided to extract accentColor but no color was found. Make sure the className includes a color utility (e.g., 'accent-red-500', 'accent-blue-600').`,
        )
    }

    return styles.accentColor
}
