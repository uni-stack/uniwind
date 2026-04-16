import { StyleDependency } from '../types'
import { ThemeName } from './types'

type SubscribeOptions = {
    once?: boolean
    shouldNotifyVariables?: (theme: ThemeName) => boolean
}

class UniwindListenerBuilder {
    private notifyingVariablesTheme: ThemeName | null = null
    private listeners = {
        [StyleDependency.ColorScheme]: new Set<() => void>(),
        [StyleDependency.Theme]: new Set<() => void>(),
        [StyleDependency.Dimensions]: new Set<() => void>(),
        [StyleDependency.Orientation]: new Set<() => void>(),
        [StyleDependency.Insets]: new Set<() => void>(),
        [StyleDependency.FontScale]: new Set<() => void>(),
        [StyleDependency.Rtl]: new Set<() => void>(),
        [StyleDependency.AdaptiveThemes]: new Set<() => void>(),
        [StyleDependency.Variables]: new Set<() => void>(),
    }

    notify(dependencies: Array<StyleDependency>) {
        dependencies.forEach(dep => {
            this.listeners[dep].forEach(callback => callback())
        })
    }

    notifyVariables(theme: ThemeName) {
        this.notifyingVariablesTheme = theme
        this.listeners[StyleDependency.Variables].forEach(callback => callback())
        this.notifyingVariablesTheme = null
    }

    notifyAll() {
        Object.values(this.listeners).forEach(listenerSet => {
            listenerSet.forEach(callback => callback())
        })
    }

    subscribe(listener: () => void, dependencies: Array<StyleDependency>, options?: SubscribeOptions) {
        const wrappedListeners = new Map<StyleDependency, () => void>()

        const dispose = () => {
            wrappedListeners.forEach((wrappedListener, dep) => {
                this.listeners[dep].delete(wrappedListener)
            })
            wrappedListeners.clear()
        }

        dependencies.forEach(dep => {
            const wrappedListener = () => {
                if (dep === StyleDependency.Variables && this.notifyingVariablesTheme !== null) {
                    const shouldNotify = options?.shouldNotifyVariables?.(this.notifyingVariablesTheme) ?? true

                    if (!shouldNotify) {
                        return
                    }
                }

                listener()

                if (options?.once) {
                    dispose()
                }
            }

            wrappedListeners.set(dep, wrappedListener)
            this.listeners[dep].add(wrappedListener)
        })

        return dispose
    }
}

export const UniwindListener = new UniwindListenerBuilder()
