const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('@niibase/uniwind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]

config.resolver.nodeModulesPaths = [
    path.join(projectRoot, 'node_modules'),
    path.join(workspaceRoot, 'node_modules'),
]

module.exports = withUniwindConfig(config, {
    cssEntryFile: 'global.css',
    extraThemes: ['premium'],
    polyfills: { rem: 14 },
    debug: true,
})
