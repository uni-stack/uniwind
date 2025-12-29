import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Dimensions } from 'react-native'
import { compileVirtual } from '../src/metro/compileVirtual'
import { Platform } from '../src/metro/types'
import { SAFE_AREA_INSET_BOTTOM, SAFE_AREA_INSET_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from './consts'

jest.spyOn(Dimensions, 'get').mockReturnValue({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, scale: 1, fontScale: 1 })

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
            Uniwind.updateInsets({
            top: ${SAFE_AREA_INSET_TOP},
            left: 0,
            bottom: ${SAFE_AREA_INSET_BOTTOM},
            right: 0,
        });
    `,
    )
})
