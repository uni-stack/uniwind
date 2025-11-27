import type { PluginCreator } from 'postcss'

const ONE_PX = '1px'

const plugin: PluginCreator<{}> = () => ({
    postcssPlugin: 'uniwind-postcss',
    Declaration: (decl) => {
        decl.value = decl.value.replace(/hairlineWidth\(\)/g, ONE_PX)

        // pixelRatio(x) → calc(x * 1px)
        decl.value = decl.value.replace(
            /pixelRatio\((.*?)\)/g,
            (_, arg) => `calc(${arg !== '' ? arg : ONE_PX} * ${ONE_PX})`,
        )

        // fontScale(x) → calc(x * 1rem)
        decl.value = decl.value.replace(
            /fontScale\((.*?)\)/g,
            (_, arg) => `calc(${arg !== '' ? arg : ONE_PX} * 1rem)`,
        )
    },
})

plugin.postcss = true

export default plugin
