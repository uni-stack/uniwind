const { createMetroConfig } = require('../metro.shared')

module.exports = createMetroConfig({
    cssEntryFile: 'remote-a.css',
    projectRoot: __dirname,
    federation: {
        name: 'remoteA',
        filename: 'remoteA.bundle',
        exposes: {
            './Panel': './src/RemotePanel.tsx',
        },
        shareStrategy: 'version-first',
    },
})
