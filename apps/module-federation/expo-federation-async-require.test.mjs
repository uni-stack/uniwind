import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('./expo-federation-async-require.js', import.meta.url), 'utf8')
const context = {
    __METRO_GLOBAL_PREFIX__: 'test',
}

runInNewContext(`${source}\nglobalThis.__getBundleId = getBundleId`, context)

const getBundleId = context.__getBundleId

test('strips a matching public path at a URL boundary', () => {
    assert.equal(
        getBundleId('http://localhost:8082/chunks/remote.bundle?platform=ios', 'http://localhost:8082'),
        'chunks/remote',
    )
})

test('does not strip hosts or path segments that only share a prefix', () => {
    assert.equal(
        getBundleId('http://localhost:80820/chunks/remote.bundle', 'http://localhost:8082'),
        'http://localhost:80820/chunks/remote',
    )
    assert.equal(
        getBundleId('http://localhost:8082/remotes-extra/remote.bundle', 'http://localhost:8082/remotes'),
        'http://localhost:8082/remotes-extra/remote',
    )
})
