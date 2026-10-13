import type { Selector } from 'lightningcss'
import type { StyleTemplate } from './types'

type Layer = {
    order: Array<number>
    children: Map<string | symbol, Layer>
}

type CascadeRule = {
    meta: StyleTemplate['meta']
    layer: Array<number>
    specificity: number
    order: number
}

// All observable selector components are class-like. :where() has zero specificity.
export const getSpecificity = (selector: Selector, parent: number) =>
    selector.reduce((sum, component) => {
        if (component.type === 'nesting') {
            return sum + parent
        }

        return sum + Number(
            component.type === 'class' || component.type === 'attribute'
                || (component.type === 'pseudo-class' && component.kind !== 'where'),
        )
    }, parent > 0 && !selector.some(component => component.type === 'nesting') ? parent : 0)

const compareLayers = (a: Array<number>, b: Array<number>) => {
    for (let index = 0; index < Math.max(a.length, b.length); index++) {
        // Declarations directly in a layer follow its sublayers; unlayered rules follow all layers.
        const left = a[index] ?? Infinity
        const right = b[index] ?? Infinity

        if (left !== right) {
            return left > right ? 1 : -1
        }
    }

    return 0
}

export class Cascade {
    private layer: Layer = {
        order: [],
        children: new Map(),
    }
    private rules = new Map<StyleTemplate['meta'], CascadeRule>()

    declareLayer(name: Array<string> | null) {
        return (name ?? [Symbol()]).reduce<Layer>((parent, part) => {
            let layer = parent.children.get(part)

            if (!layer) {
                layer = {
                    order: [...parent.order, parent.children.size],
                    children: new Map(),
                }
                parent.children.set(part, layer)
            }

            return layer
        }, this.layer)
    }

    withLayer(name: Array<string> | null, parse: () => void) {
        const parent = this.layer

        this.layer = this.declareLayer(name)
        parse()
        this.layer = parent
    }

    add(meta: StyleTemplate['meta'], specificity: number, order: number) {
        this.rules.set(meta, { meta, layer: this.layer.order, specificity, order })
    }

    assignRanks() {
        const rules = [...this.rules.values()]

        for (const important of [false, true]) {
            rules.sort((a, b) =>
                compareLayers(a.layer, b.layer) * (important ? -1 : 1)
                || a.specificity - b.specificity
                || a.order - b.order
            )
            rules.forEach(({ meta }, index) => {
                meta[important ? 'importantComplexity' : 'complexity'] = index + (important ? rules.length : 0)
            })
        }
    }
}
