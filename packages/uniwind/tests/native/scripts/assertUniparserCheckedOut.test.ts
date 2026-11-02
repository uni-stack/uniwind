import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { assertUniparserCheckedOut } from '../../../scripts/assertUniparserCheckedOut'

const packageRoot = join(__dirname, '../../..')

describe('assertUniparserCheckedOut', () => {
    test('throws the submodule hint for a package without the engine sources', () => {
        const emptyPackage = mkdtempSync(join(tmpdir(), 'uniwind-no-engine-'))

        expect(() => assertUniparserCheckedOut(emptyPackage)).toThrow('uniparser submodule missing: run git submodule update --init')
    })

    test('passes for this package', () => {
        expect(() => assertUniparserCheckedOut(packageRoot)).not.toThrow()
    })
})
