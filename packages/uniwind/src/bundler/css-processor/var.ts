import type { Variable } from 'lightningcss'
import type { ProcessorBuilder } from './processor'

export class Var {
    constructor(private readonly Processor: ProcessorBuilder) {}

    processVar(variable: Variable): string {
        const value = `vars[${JSON.stringify(variable.name.ident)}]?.(vars)`

        if (!variable.fallback) {
            return value
        }

        // `var(--x,)` declares an empty fallback, which Tailwind relies on to compose
        // optional parts (filters), so it must resolve to an empty string, not `undefined`.
        // The trailing space keeps consecutive parts separate tokens for serialization.
        if (variable.fallback.length === 0) {
            return `${value} ?? "" `
        }

        const fallback = this.Processor.CSS.processValue(variable.fallback)

        return `${value} ?? ${fallback}`
    }
}
