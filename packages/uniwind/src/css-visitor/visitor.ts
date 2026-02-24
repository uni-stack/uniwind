import { CustomAtRules, Visitor } from 'lightningcss'
import { FunctionVisitor } from './function-visitor'
import { RuleVisitor } from './rule-visitor'

export class UniwindCSSVisitor implements Visitor<CustomAtRules> {
    Function: Visitor<CustomAtRules>['Function']
    Rule: Visitor<CustomAtRules>['Rule']

    constructor(private readonly themes: Array<string>) {
        this.Function = new FunctionVisitor()
        this.Rule = new RuleVisitor(this.themes)
    }
}
