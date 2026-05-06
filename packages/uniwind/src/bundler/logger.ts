const red = '\x1b[91m'
const yellow = '\x1b[33m'
const blue = '\x1b[36m'
const reset = '\x1b[0m'

export class Logger {
    static debug = false

    constructor(private readonly name: string) {}

    static log(message: string, meta = '') {
        if (!Logger.debug) {
            return
        }

        console.log(`${blue}Uniwind ${meta}- ${message}${reset}`)
    }

    static error(message: string, meta = '') {
        console.log(`${red}Uniwind Error ${meta}- ${message}${reset}`)
    }

    static warn(message: string, meta = '') {
        if (!Logger.debug) {
            return
        }

        console.log(`${yellow}Uniwind Warning ${meta}- ${message}${reset}`)
    }

    log(message: string) {
        Logger.log(message, `[${this.name} Processor] `)
    }

    error(message: string) {
        Logger.error(message, `[${this.name} Processor] `)
    }

    warn(message: string) {
        Logger.warn(message, `[${this.name} Processor] `)
    }
}
