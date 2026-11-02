import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const ENGINE_SENTINEL = 'src/uniparser/src/common/consts.ts'

export const assertUniparserCheckedOut = (packageRoot: string) => {
    if (!existsSync(join(packageRoot, ENGINE_SENTINEL))) {
        throw new Error('uniparser submodule missing: run git submodule update --init')
    }
}

const entryScript = process.argv[1]

if (entryScript !== undefined && resolve(entryScript) === resolve(__filename)) {
    assertUniparserCheckedOut(join(dirname(entryScript), '..'))
}
