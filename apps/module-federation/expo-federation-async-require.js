const cache = new Map()
const metroGlobalPrefix = __METRO_GLOBAL_PREFIX__

const isUrl = value => /^https?:\/\//.test(value)

const getPublicPath = origin => origin?.split('/').slice(0, -1).join('/')

const getBundleId = (bundlePath, publicPath) => {
    let value = bundlePath

    if (isUrl(value)) {
        value = value.replace(publicPath, '')
    }

    return value
        .replace(/^\/+/, '')
        .split('?')[0]
        .replaceAll('\\', '/')
        .replace('.bundle', '')
}

const loadBundle = async url => {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`)
    }

    const code = await response.text()
    globalThis.eval(code)
}

globalThis[`${metroGlobalPrefix}__loadBundleAsync`] = async bundlePath => {
    const scope = globalThis.__FEDERATION__?.__NATIVE__?.[metroGlobalPrefix]

    if (!scope) {
        throw new Error(
            `Missing Module Federation scope for "${metroGlobalPrefix}" while loading "${bundlePath}"`,
        )
    }

    const publicPath = getPublicPath(scope.origin)

    if (!isUrl(bundlePath) && !publicPath) {
        throw new Error(
            `Missing Module Federation origin for "${metroGlobalPrefix}" while loading relative bundle "${bundlePath}"`,
        )
    }

    const url = isUrl(bundlePath)
        ? bundlePath
        : new URL(bundlePath, `${publicPath}/`).toString()

    let pending = cache.get(url)

    if (!pending) {
        pending = loadBundle(url).catch(error => {
            cache.delete(url)
            throw error
        })
        cache.set(url, pending)
    }

    await pending

    const bundleId = getBundleId(url, publicPath)
    const shared = scope.deps.shared[bundleId] ?? []
    const remotes = scope.deps.remotes[bundleId] ?? []
    const registry = require('mf:remote-module-registry')

    await Promise.all([
        ...shared.map(registry.loadSharedToRegistry),
        ...remotes.map(registry.loadRemoteToRegistry),
    ])
}
