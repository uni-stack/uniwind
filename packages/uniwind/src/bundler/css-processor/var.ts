import { Variable } from 'lightningcss'
import type { ProcessorBuilder } from './processor'

export class Var {
    constructor(private readonly Processor: ProcessorBuilder) {}

    processVar(variable: Variable): string {
        const value = `this[\`${variable.name.ident}\`]`

        if (!variable.fallback || variable.fallback.length === 0) {
            return value
        }

        const fallback = this.Processor.CSS.processValue(variable.fallback)

        return `${value} ?? ${fallback}`
    }
}
