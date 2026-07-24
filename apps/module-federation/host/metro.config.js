const { createMetroConfig } = require('../metro.shared')

module.exports = createMetroConfig({
    cssEntryFile: 'host.css',
    projectRoot: __dirname,
    federation: {
        name: 'uniwindHost',
        remotes: {
            remoteA: 'remoteA@http://localhost:8082/mf-manifest.json',
            remoteB: 'remoteB@http://localhost:8083/mf-manifest.json',
        },
        shareStrategy: 'loaded-first',
    },
})
