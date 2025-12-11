import { readFileSync } from 'fs'
import { resolve } from 'path'
import { compileVirtual } from '../src/metro/compileVirtual'
import { Platform } from '../src/metro/types'

beforeAll(async () => {
    const cssPath = resolve('./tests/test.css')
    const css = readFileSync(cssPath, 'utf-8')
    const virtualCode = await compileVirtual({
        css,
        cssPath,
        debug: true,
        platform: Platform.iOS,
        themes: ['light', 'dark'],
        polyfills: undefined,
    })

    eval(
        `const { Uniwind } = require('../src/core/config/config.native');
        Uniwind.__reinit(rt => ${virtualCode}, ['light', 'dark']);
    `,
    )
})
