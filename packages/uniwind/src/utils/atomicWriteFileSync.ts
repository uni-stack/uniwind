import crypto from 'crypto'
import fs from 'fs'

/**
 * Write a file by staging to a temp path in the same directory and renaming
 * onto the target. `rename` is atomic on POSIX and Windows, so concurrent
 * readers always observe either the previous file or the complete new file —
 * never a partial write. See https://github.com/uni-stack/uniwind/issues/341.
 */
export const atomicWriteFileSync = (filePath: string, content: string) => {
    const tmpPath = `${filePath}.${crypto.randomUUID()}.tmp`
    fs.writeFileSync(tmpPath, content)
    try {
        fs.renameSync(tmpPath, filePath)
    } catch (err) {
        // best-effort cleanup
        try {
            fs.unlinkSync(tmpPath)
        } catch {}
        throw err
    }
}
