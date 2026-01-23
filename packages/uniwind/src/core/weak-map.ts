// This code was taken from https://github.com/nativewind/react-native-css/blob/main/src/native/reactivity.ts#L150
// to add reactivity for reanimated 4

type WeakFamilyFn<Key, Args = undefined, Result = Key> =
    & ((
        key: Key,
        args: Args,
    ) => Result)
    & {
        has(key: Key): boolean
    }

export function weakFamily<Key extends WeakKey, Result = Key>(
    fn: (key: Key) => Result,
): WeakFamilyFn<Key, void, Result>
export function weakFamily<Key extends WeakKey, Args = undefined, Result = Key>(
    fn: (key: Key, args: Args) => Result,
): WeakFamilyFn<Key, Args, Result>
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function weakFamily<Key extends WeakKey, Args = undefined, Result = Key>(
    fn: (key: Key, args: Args) => Result,
): WeakFamilyFn<Key, Args, Result> {
    const map = new WeakMap<Key, Result>()
    return Object.assign(
        (key: Key, args: Args) => {
            if (!map.has(key)) {
                const value = fn(key, args)
                map.set(key, value)
                return value
            }
            return map.get(key)!
        },
        {
            has: (key: Key) => map.has(key),
        },
    )
}
