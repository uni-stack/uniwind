export const isDefined = <T>(value: T): value is NonNullable<T> => value !== undefined && value !== null

export const arrayEquals = <T>(a: Array<T>, b: Array<T>) => {
    if (a.length !== b.length) {
        return false
    }

    return a.every((value, index) => value === b[index])
}
