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
