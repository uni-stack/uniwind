// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('@niibase/uniwind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.watchFolders = [
    ...config.watchFolders,
    path.join(workspaceRoot, 'packages/uniwind'),
]

config.resolver.nodeModulesPaths = [
    ...config.resolver.nodeModulesPaths,
    path.join(projectRoot, 'node_modules'),
    path.join(workspaceRoot, 'node_modules'),
]

module.exports = withUniwindConfig(config, {
    cssEntryFile: './globals.css',
    extraThemes: ['sepia', 'bubblegum'],
    debug: true,
})
