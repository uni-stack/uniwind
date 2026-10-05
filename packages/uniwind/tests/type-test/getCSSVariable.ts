import { Uniwind, useCSSVariable } from 'uniwind'
import type { Equal, Expect } from './checks'

type CSSVariable = string | number | undefined

const singleCSSVariableHook = useCSSVariable('--color-red-500')

type SingleCSSVariableHookTest = Expect<Equal<CSSVariable, typeof singleCSSVariableHook>>

const doubleCSSVariableHook = useCSSVariable(['--color-red-500', '--color-red-500'])

type DoubleCSSVariableHookTest = Expect<Equal<[CSSVariable, CSSVariable], typeof doubleCSSVariableHook>>

const variablesProp = ['--color-red-500', '--color-red-500']
const multipleCSSVariableHook = useCSSVariable(variablesProp)

type MultipleCSSVariableHookTest = Expect<Equal<Array<CSSVariable>, typeof multipleCSSVariableHook>>

const singleCSSVariable = Uniwind.getCSSVariable('--color-red-500')

type SingleCSSVariableTest = Expect<Equal<CSSVariable, typeof singleCSSVariable>>

const doubleCSSVariable = Uniwind.getCSSVariable(['--color-red-500', '--color-red-500'])

type DoubleCSSVariableTest = Expect<Equal<[CSSVariable, CSSVariable], typeof doubleCSSVariable>>

const multipleCSSVariable = Uniwind.getCSSVariable(variablesProp)

type MultipleCSSVariableTest = Expect<Equal<Array<CSSVariable>, typeof multipleCSSVariable>>
