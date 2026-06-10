import { rmSync } from 'fs'
import { Dimensions } from 'react-native'
import { UniwindBundlerConfig } from '../src/bundler/config'
import { compileCSS } from '../src/bundler/css-compiler'
import { Platform } from '../src/common/consts'
import { SAFE_AREA_INSET_BOTTOM, SAFE_AREA_INSET_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from './consts'

jest.spyOn(Dimensions, 'get').mockReturnValue({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, scale: 1, fontScale: 1 })

beforeAll(async () => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig({
        cssEntryFile: './tests/test.css',
    }, Platform.iOS)
    await bundlerConfig.generateArtifacts('./uniwind.css')
    rmSync('uniwind-types.d.ts', { force: true })
    const virtualCode = await compileCSS(bundlerConfig)

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

afterEach(() => {
    const { UniwindStore } = require('../src/core/native')

    UniwindStore.cache = Object.fromEntries(Object.keys(UniwindStore.cache).map(theme => [theme, new Map()]))
})
