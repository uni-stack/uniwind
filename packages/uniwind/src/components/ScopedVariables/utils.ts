import { Logger } from '../../core/logger'
import type { CSSVariables, UniwindContextType } from '../../core/types'

export type ScopedVariablesProps = {
    /**
     * CSS variables to override for this subtree. Keys must start with `--`;
     * values are `string | number` (numbers become px on web, colors are
     * normalized on native).
     *
     * Prefer a **stable** reference — define this object outside render or wrap
     * it in `useMemo`. An inline object is a new reference every render, which
     * recomputes the provider value and re-renders every consumer in the
     * subtree (the same guidance as any React context provider value).
     */
    variables: CSSVariables
    /**
     * Opt-in native style caching for this subtree.
     *
     * By default a `<ScopedVariables>` subtree bypasses the native style cache
     * (styles are recomputed on every render) so overrides always take effect
     * without serializing the variable map on every resolve.
     *
     * Pass a **stable** string that uniquely identifies this variable set and
     * the native runtime will fold it into the style cache key and reuse cached
     * results. You own the stability contract: if you pass the same `cacheKey`
     * for different variable values, stale styles will be served.
     *
     * Caching only engages when every ancestor `<ScopedVariables>` in the merge
     * chain also opted in; if any ancestor bypasses, this subtree bypasses too.
     */
    cacheKey?: string
}

// Drop keys that aren't custom properties in every build, not just dev: an
// invalid key left in `context.variables` reaches `applyScopedVariables`, which
// would set an inheritable property (e.g. `color`) on the web read helper and
// could corrupt a resolved value. Only the dev warning is gated on `__DEV__`.
const validateVariables = (variables: CSSVariables) =>
    Object.fromEntries(
        Object.entries(variables).filter(([name]) => {
            if (!name.startsWith('--')) {
                if (__DEV__) {
                    Logger.error(`CSS variable name must start with "--", instead got: ${name}`)
                }

                return false
            }

            return true
        }),
    )

/**
 * Builds the context value for a `<ScopedVariables>` provider.
 *
 * - Merges variables with ancestors: `{ ...inherited, ...own }`, nearest wins.
 * - Derives `variablesCacheKey` for the native cache:
 *   - `null` (bypass) when no `cacheKey` is supplied, or when an ancestor with
 *     variables did not opt in (its variable set is not guaranteed stable).
 *   - otherwise a combined, collision-resistant key of ancestor + own keys.
 */
export const buildScopedVariablesContext = (
    parent: UniwindContextType,
    variables: CSSVariables,
    cacheKey: string | undefined,
): UniwindContextType => {
    const ancestorHasVariables = parent.variables !== null
    const ancestorIsCacheable = !ancestorHasVariables || parent.variablesCacheKey !== null

    // NULL separator can't appear in user-supplied keys, so ancestor + own
    // keys combine without ambiguity.
    const variablesCacheKey = cacheKey === undefined || !ancestorIsCacheable
        ? null
        : `${parent.variablesCacheKey ?? ''}\0${cacheKey}`

    return {
        ...parent,
        variables: {
            ...parent.variables,
            ...validateVariables(variables),
        },
        variablesCacheKey,
    }
}
