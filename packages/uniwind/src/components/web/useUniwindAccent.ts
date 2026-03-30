import { isDefined } from '../../common/utils'
import { Logger } from '../../core/logger'
import { formatColor } from '../../core/web/formatColor'
import { useResolveClassNames } from '../../hooks/useResolveClassNames'

let warnedOnce = false

export const useUniwindAccent = (className: string | undefined) => {
    const styles = useResolveClassNames(className ?? '')

    if (__DEV__ && !warnedOnce && isDefined(className) && className.trim() !== '' && styles.accentColor === undefined) {
        warnedOnce = true
        Logger.warn(
            `className '${className}' was provided to extract accentColor but no color was found. Make sure the className includes a color utility (e.g., 'accent-red-500', 'accent-blue-600'). See https://docs.uniwind.dev/class-names#the-accent-prefix`,
        )
    }

    return styles.accentColor !== undefined
        ? formatColor(styles.accentColor)
        : undefined
}
