import { CustomAtRules, Visitor } from 'lightningcss'
import { FunctionVisitor } from './function-visitor'
import { RuleVisitor } from './rule-visitor'

export class UniwindCSSVisitor implements Visitor<CustomAtRules> {
    Function: Visitor<CustomAtRules>['Function']
    Rule: Visitor<CustomAtRules>['Rule']
    StyleSheet: Visitor<CustomAtRules>['StyleSheet']

    constructor(private readonly themes: Array<string>) {
        const ruleVisitor = new RuleVisitor(this.themes)

        this.Function = new FunctionVisitor()
        this.Rule = ruleVisitor

        this.StyleSheet = () => {
            ruleVisitor.cleanup()
        }
    }
}
