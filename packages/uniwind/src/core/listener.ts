import { StyleDependency } from '../types'

type SubscribeOptions = {
    once?: boolean
}

class UniwindListenerBuilder {
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

    notifyAll() {
        Object.values(this.listeners).forEach(listenerSet => {
            listenerSet.forEach(callback => callback())
        })
    }

    subscribe(listener: () => void, dependencies: Array<StyleDependency>, options?: SubscribeOptions) {
        const dispose = () => {
            dependencies.forEach(dep => {
                this.listeners[dep].delete(listener)
            })
        }

        dependencies.forEach(dep => {
            this.listeners[dep].add(() => {
                listener()

                if (options?.once) {
                    dispose()
                }
            })
        })

        return () => {
            dispose()
        }
    }
}

export const UniwindListener = new UniwindListenerBuilder()
