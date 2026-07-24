import { spawnSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const pidFile = fileURLToPath(new URL('./.servers.pid', import.meta.url))
let pid

try {
    pid = Number.parseInt(readFileSync(pidFile, 'utf8'), 10)
} catch (error) {
    if (error?.code === 'ENOENT') {
        console.log('[module-federation] No managed servers are running')
        process.exit(0)
    }

    throw error
}

const processInfo = spawnSync('ps', ['-p', String(pid), '-o', 'command='], {
    encoding: 'utf8',
})

if (processInfo.error) {
    throw processInfo.error
}

if (
    processInfo.status !== 0
    || !processInfo.stdout.includes('start.mjs')
) {
    rmSync(pidFile)
    console.log('[module-federation] Removed a stale server PID file')
    process.exit(0)
}

const result = spawnSync('kill', ['-TERM', String(pid)], {
    stdio: 'inherit',
})

if (result.error) {
    throw result.error
}

if (result.status !== 0) {
    process.exit(result.status ?? 1)
}

console.log(`[module-federation] Stopped servers managed by PID ${pid}`)
