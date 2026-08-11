import { readFileSync, rmSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isManagedLauncher } from './managed-launcher.mjs'

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

if (!isManagedLauncher(pid)) {
    rmSync(pidFile)
    console.log('[module-federation] Removed a stale server PID file')
    process.exit(0)
}

try {
    process.kill(pid, 'SIGTERM')
} catch (error) {
    if (error?.code === 'ESRCH') {
        rmSync(pidFile)
        console.log('[module-federation] Removed a stale server PID file')
        process.exit(0)
    }

    throw error
}

console.log(`[module-federation] Stopped servers managed by PID ${pid}`)
