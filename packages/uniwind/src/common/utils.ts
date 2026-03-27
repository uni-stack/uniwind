export const isDefined = <T>(value: T): value is NonNullable<T> => value !== undefined && value !== null
