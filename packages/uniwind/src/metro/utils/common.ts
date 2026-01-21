export const isDefined = <T>(value: T): value is NonNullable<T> => value !== null && value !== undefined

export const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

type P<I, O> = (data: I) => O
type PipeFns<T> = {
    <A>(a: P<T, A>): A
    <A, B>(a: P<T, A>, b: P<A, B>): B
    <A, B, C>(a: P<T, A>, b: P<A, B>, c: P<B, C>): C
    <A, B, C, D>(a: P<T, A>, b: P<A, B>, c: P<B, C>, d: P<C, D>): D
    <A, B, C, D, E>(a: P<T, A>, b: P<A, B>, c: P<B, C>, d: P<C, D>, e: P<D, E>): E
    <A, B, C, D, E, F>(a: P<T, A>, b: P<A, B>, c: P<B, C>, d: P<C, D>, e: P<D, E>, f: P<E, F>): F
    <A, B, C, D, E, F, G>(a: P<T, A>, b: P<A, B>, c: P<B, C>, d: P<C, D>, e: P<D, E>, f: P<E, F>, g: P<F, G>): G
    <A, B, C, D, E, F, G, H>(a: P<T, A>, b: P<A, B>, c: P<B, C>, d: P<C, D>, e: P<D, E>, f: P<E, F>, g: P<F, G>, h: P<G, H>): H
    (...fns: Array<P<T, T>>): T
}

export const pipe = <T>(data: T) => ((...fns: Array<any>) => fns.reduce((acc, fn) => fn(acc), data)) as PipeFns<T>

export const isNumber = (data: any) => {
    if (typeof data === 'number') {
        return true
    }

    if (typeof data === 'string' && data !== '') {
        return !isNaN(Number(data))
    }

    return false
}

export const smartSplit = (str: string, separator = ' ' as string | RegExp) => {
    const escaper = '&&&'

    return pipe(str)(
        x => x.replace(/\s\?\?\s/g, `${escaper}??${escaper}`),
        x => x.replace(/\s([+\-*/])\s/g, `${escaper}$1${escaper}`),
        x => x.split(separator),
        x => x.map(token => token.replace(new RegExp(escaper, 'g'), ' ')),
    )
}

export const addMissingSpaces = (str: string) =>
    pipe(str)(
        x => x.trim(),
        x => x.replace(/([^ {])this/g, '$1 this'),
        x => x.replace(/\](?=\d)/g, '] '),
        x => x.replace(/\)(?=\S)/g, ') '),
        x => x.replace(/(?<!^)(?<!\s)"(?=\d)/g, '" '),
    )

export const uniq = <T>(arr: Array<T>) => Array.from(new Set(arr))

export const isValidJSValue = (jsValueString: string) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
        new Function(`const test = ${jsValueString}`)

        return true
    } catch {
        return false
    }
}

export const shouldBeSerialized = (value: string) => {
    if (value.includes('-')) {
        return value.split('-').some(shouldBeSerialized)
    }

    return [
        isNumber(value),
        value.startsWith('this['),
        value.startsWith('rt.'),
        /[*/+-]/.test(value),
        value.includes('"'),
        value.includes(' '),
        value === '(',
        value === ')',
    ].some(Boolean)
}

export const roundToPrecision = (value: number, precision: number) => parseFloat(value.toFixed(precision))

export const deepEqual = <T>(a: T, b: T): boolean => {
    if (Object.is(a, b)) {
        return true
    }

    if (
        typeof a !== 'object'
        || a === null
        || typeof b !== 'object'
        || b === null
    ) {
        return false
    }

    const keysA = Object.keys(a) as Array<keyof T>

    if (keysA.length !== Object.keys(b).length) {
        return false
    }

    return keysA.every(key => deepEqual(a[key], b[key]) && Object.prototype.hasOwnProperty.call(b, key))
}

export const removeKeys = <TObj extends Record<PropertyKey, any>, TKey extends keyof TObj>(obj: TObj, keysToRemove: Array<TKey>) =>
    Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keysToRemove.includes(key as TKey)),
    ) as Omit<TObj, TKey>
