const { createMetroConfig } = require('../metro.shared')

module.exports = createMetroConfig({
    cssEntryFile: 'remote-b.css',
    projectRoot: __dirname,
    federation: {
        name: 'remoteB',
        filename: 'remoteB.bundle',
        exposes: {
            './Panel': './src/RemotePanel.tsx',
        },
        shareStrategy: 'version-first',
    },
})
