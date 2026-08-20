import { spawnSync } from 'node:child_process'
import process from 'node:process'

export const isManagedLauncher = pid => {
    if (!Number.isInteger(pid) || pid <= 0) {
        return false
    }

    try {
        process.kill(pid, 0)
    } catch (error) {
        if (error?.code === 'ESRCH') {
            return false
        }

        if (error?.code !== 'EPERM') {
            throw error
        }
    }

    const processInfo = spawnSync('ps', ['-p', String(pid), '-o', 'command='], {
        encoding: 'utf8',
    })

    if (processInfo.error) {
        throw processInfo.error
    }

    return processInfo.status === 0 && processInfo.stdout.includes('start.mjs')
}
