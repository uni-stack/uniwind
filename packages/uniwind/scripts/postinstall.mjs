/* eslint-disable no-undef */
/* eslint-disable no-console */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get the package root (one level up from scripts/)
const packageRoot = dirname(__dirname)
const isInNodeModules = resolve(packageRoot, '../').endsWith('node_modules')

if (isInNodeModules) {
    const packageJsonPath = join(packageRoot, 'package.json')
    const distSharedPath = join(packageRoot, 'dist', 'shared')

    try {
        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
        const updatedPackageJson = packageJsonContent.replace(
            /"name":\s*"@niibase\/uniwind",/g,
            '"name": "uniwind",',
        )
        writeFileSync(packageJsonPath, updatedPackageJson, 'utf-8')
        console.log('Updated package.json name field')
    } catch (error) {
        console.error('Error updating package.json:', error.message)
    }

    try {
        if (statSync(distSharedPath).isDirectory()) {
            const files = readdirSync(distSharedPath)

            files
                .map(file => ({
                    file,
                    filePath: join(distSharedPath, file),
                }))
                .filter(({ filePath }) => statSync(filePath).isFile())
                .forEach(({ file, filePath }) => {
                    const content = readFileSync(filePath, 'utf-8')
                    const updatedContent = content.replace(
                        /const name = "@niibase\/uniwind";/g,
                        'const name = "uniwind";',
                    )

                    if (content !== updatedContent) {
                        writeFileSync(filePath, updatedContent, 'utf-8')
                        console.log(`Updated ${file}`)
                    }
                })
        }
    } catch (error) {
        console.error('Error updating dist/shared files:', error?.message)
    }
}
