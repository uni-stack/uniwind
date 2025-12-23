export const copyComponentProperties = <T extends object>(Component: T, UniwindComponent: any): T => {
    Object.entries(Component).forEach(([key, value]) => {
        // Filter out the keys we don't want to copy
        if (['$$typeof', 'render', 'contextType'].includes(key)) {
            return
        }

        UniwindComponent[key] = value
    })

    // @ts-expect-error Hidden property
    UniwindComponent.displayName = Component.displayName
    UniwindComponent.prototype = Object.getPrototypeOf(Component)

    return UniwindComponent
}
