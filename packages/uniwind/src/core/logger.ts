/* eslint-disable no-console */

export class Logger {
    static log(message: string) {
        console.log(`Uniwind - ${message}`)
    }

    static error(message: string) {
        console.error(`Uniwind - ${message}`)
    }

    static warn(message: string) {
        console.warn(`Uniwind - ${message}`)
    }
}
