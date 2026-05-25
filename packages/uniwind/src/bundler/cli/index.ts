#!/usr/bin/env node

import { UniwindBundlerConfig } from '@/bundler/config'
import { Logger } from '@/bundler/logger'
import { fileURLToPath } from 'node:url'
import path from 'path'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const cssArtifactPath = path.resolve(dirname, '../../uniwind.css')

type GenerateArtifactsArgs = {
    cssEntryFile?: string
    dtsFile?: string
    extraThemes: Array<string>
}

const printHelp = () => {
    console.log([
        'Usage: uniwind generate-artifacts --css <file> [--theme <name>...] [--dts <file>]',
        '',
        'Options:',
        '  --css <file>      CSS entry file path, e.g. ./global.css',
        '  --theme <name>    Extra theme name. Can be passed multiple times',
        '  --dts <file>      Generated TypeScript declarations path',
        '  --help            Show help',
    ].join('\n'))
}

const readValue = (args: Array<string>, index: number, flag: string) => {
    const value = args[index + 1]

    if (value === undefined || value.startsWith('--')) {
        throw new Error(`Uniwind: ${flag} requires a value`)
    }

    return value
}

const parseGenerateArtifactsArgs = (args: Array<string>): GenerateArtifactsArgs => {
    const parsed: GenerateArtifactsArgs = {
        extraThemes: [],
    }

    for (let index = 0; index < args.length; index++) {
        const arg = args[index]

        switch (arg) {
            case '--css':
                parsed.cssEntryFile = readValue(args, index, arg)
                index++
                break
            case '--theme':
                parsed.extraThemes.push(readValue(args, index, arg))
                index++
                break
            case '--dts':
                parsed.dtsFile = readValue(args, index, arg)
                index++
                break
            case '--help':
                printHelp()
                process.exit(0)
            default:
                throw new Error(`Uniwind: Unknown option ${arg}`)
        }
    }

    return parsed
}

const generateArtifacts = async (args: Array<string>) => {
    const parsed = parseGenerateArtifactsArgs(args)
    const bundlerConfig = UniwindBundlerConfig.fromCliConfig({
        cssEntryFile: parsed.cssEntryFile!,
        dtsFile: parsed.dtsFile,
        extraThemes: parsed.extraThemes,
    })

    await bundlerConfig.generateArtifacts(cssArtifactPath)
    Logger.info('Artifacts generated')
}

const main = async () => {
    const [command, ...args] = process.argv.slice(2)

    if (command === '--help' || command === undefined) {
        printHelp()

        return
    }

    switch (command) {
        case 'generate-artifacts':
            await generateArtifacts(args)

            break
        default:
            throw new Error(`Uniwind: Unknown command ${command}`)
    }
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
})
