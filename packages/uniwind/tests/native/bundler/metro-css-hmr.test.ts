import { execFileSync } from 'node:child_process'
import path from 'node:path'

// The child process uses real Metro workers and isolates their watchers from Jest.
test.each([
    ['bare', 'ios'],
    ['bare', 'android'],
    ['expo', 'ios'],
    ['expo', 'android'],
])('delivers token-only HMR updates with %s Metro on %s', (kind, platform) => {
    const output = execFileSync(process.execPath, [path.join(__dirname, 'fixtures/metro-css-hmr.cjs'), kind, platform], {
        encoding: 'utf8',
        timeout: 30_000,
        env: { ...process.env, NODE_ENV: 'development' },
        stdio: ['ignore', 'pipe', 'pipe'],
    })
    const result = JSON.parse(output)

    expect(result.expoWorker).toBe(kind === 'expo')
    expect(result.updates).toEqual([
        { color: '#654321', modified: expect.arrayContaining(['nested.css', 'global.css']), reset: false },
        { color: '#123456', modified: expect.arrayContaining(['nested.css', 'global.css']), reset: false },
    ])
}, 35_000)
