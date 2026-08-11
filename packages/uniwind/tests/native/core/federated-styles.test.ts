import { act, renderHook } from '@testing-library/react-native'
import { Uniwind, useCSSVariable } from '../../../src'
import { StyleDependency } from '../../../src/common/consts'
import { UniwindListener } from '../../../src/core/listener'
import { Logger } from '../../../src/core/logger'
import { UniwindStore, UniwindStoreBuilder } from '../../../src/core/native'
import type { GenerateStyleSheetsCallback, Style, ThemeName, UniwindContextType, Vars } from '../../../src/core/types'

const context = {
    rtl: null,
    scopedTheme: null,
    variables: null,
} satisfies UniwindContextType

const createStyle = (className: string, value: string | ((vars: Vars) => string)): Style => ({
    active: null,
    className,
    complexity: 0,
    dataAttributes: null,
    dependencies: null,
    disabled: null,
    entries: [
        [
            'backgroundColor',
            typeof value === 'string' ? () => value : value,
        ],
    ],
    focus: null,
    importantProperties: [],
    index: 0,
    maxWidth: Number.POSITIVE_INFINITY,
    minWidth: 0,
    native: true,
    orientation: null,
    rtl: null,
    theme: null,
})

const createRegistration = (
    styles: Record<string, string | ((vars: Vars) => string)>,
    variables: Record<string, string> = {},
): GenerateStyleSheetsCallback =>
() => ({
    scopedVars: {},
    stylesheet: Object.fromEntries(
        Object.entries(styles).map(([className, value]) => [
            className,
            [createStyle(className, value)],
        ]),
    ),
    vars: Object.fromEntries(
        Object.entries(variables).map(([name, value]) => [
            name,
            () => value,
        ]),
    ),
})

const getBackgroundColor = (className: string, theme: ThemeName = 'light') => {
    UniwindStore.runtime.currentThemeName = theme

    return UniwindStore.getStyles(className, undefined, undefined, context).styles.backgroundColor
}

describe('federated native styles', () => {
    const disposers: Array<VoidFunction> = []

    beforeEach(() => {
        UniwindStore.reinit(
            createRegistration(
                {
                    'host-conflict': '#16a34a',
                    'host-only': '#16a34a',
                    'host-variable': vars => vars['--shared-color'](vars) as string,
                },
                {
                    '--shared-color': '#16a34a',
                },
            ),
            ['light', 'dark'],
        )
    })

    afterEach(() => {
        disposers.splice(0).forEach(dispose => dispose())
    })

    test('adds explicitly prefixed remote styles without replacing the host', () => {
        disposers.push(UniwindStore.merge(
            'remote-a',
            createRegistration(
                {
                    'rma:conflict': '#facc15',
                    'rma:only': '#facc15',
                    'rma:variable': vars => vars['--rma-shared-color'](vars) as string,
                },
                {
                    '--rma-shared-color': '#facc15',
                },
            ),
            ['light', 'dark'],
        ))

        expect(getBackgroundColor('host-only')).toBe('#16a34a')
        expect(getBackgroundColor('host-conflict')).toBe('#16a34a')
        expect(getBackgroundColor('host-variable')).toBe('#16a34a')
        expect(getBackgroundColor('rma:only')).toBe('#facc15')
        expect(getBackgroundColor('rma:conflict')).toBe('#facc15')
        expect(getBackgroundColor('rma:variable')).toBe('#facc15')
    })

    test('accepts custom-theme remotes before matching host initialization', () => {
        const store = new UniwindStoreBuilder()
        const themes = ['light', 'dark', 'premium']
        const dispose = store.merge(
            'remote-a',
            createRegistration({ 'rma:only': '#facc15' }),
            themes,
        )

        try {
            store.reinit(createRegistration({ 'host-only': '#16a34a' }), themes)

            expect(store.getStyles('host-only', undefined, undefined, context).styles.backgroundColor).toBe('#16a34a')
            expect(store.getStyles('rma:only', undefined, undefined, context).styles.backgroundColor).toBe('#facc15')
        } finally {
            dispose()
        }
    })

    test('exposes remote-first custom themes through the public config', () => {
        jest.isolateModules(() => {
            const isolatedUniwind = require('../../../src/core/config/config.native').Uniwind as typeof Uniwind & {
                __mergeStyles: (
                    id: string,
                    generateStyleSheetCallback: GenerateStyleSheetsCallback,
                    themes: Array<string>,
                ) => VoidFunction
                __reinit: (generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) => void
            }
            const isolatedStore = require('../../../src/core/native').UniwindStore as typeof UniwindStore
            const themes = ['light', 'dark', 'premium']
            const dispose = isolatedUniwind.__mergeStyles(
                'remote-a',
                createRegistration({ 'rma:only': '#facc15' }),
                themes,
            )

            try {
                expect(isolatedUniwind.themes).toEqual(themes)
                expect(() => isolatedUniwind.setTheme('premium')).not.toThrow()
                expect(isolatedUniwind.currentTheme).toBe('premium')
                expect(isolatedStore.runtime.currentThemeName).toBe('premium')

                isolatedUniwind.__reinit(createRegistration({ 'host-only': '#16a34a' }), themes)

                expect(isolatedUniwind.themes).toEqual(themes)
                expect(isolatedStore.getStyles('rma:only', undefined, undefined, context).styles.backgroundColor).toBe('#facc15')
            } finally {
                dispose()
            }
        })
    })

    test('rejects host themes that differ from a remote registered first', () => {
        const store = new UniwindStoreBuilder()
        const dispose = store.merge(
            'remote-a',
            createRegistration({ 'rma:only': '#facc15' }),
            ['light', 'dark', 'premium'],
        )

        try {
            expect(() => {
                store.reinit(createRegistration({ 'host-only': '#16a34a' }), ['light', 'dark'])
            }).toThrow('Uniwind: Federated styles \'remote-a\' must use the host themes.')
        } finally {
            dispose()
        }
    })

    test('drops accidental overrides and warns once per owner and name', () => {
        const warn = jest.spyOn(Logger, 'warn').mockImplementation()
        const registration = createRegistration(
            {
                'host-conflict': '#facc15',
                'rma:host-variable': vars => vars['--shared-color'](vars) as string,
            },
            {
                '--shared-color': '#facc15',
            },
        )

        try {
            disposers.push(UniwindStore.merge(
                'remote-a',
                registration,
                ['light', 'dark'],
            ))

            expect(getBackgroundColor('host-conflict')).toBe('#16a34a')
            expect(getBackgroundColor('host-variable')).toBe('#16a34a')
            expect(getBackgroundColor('rma:host-variable')).toBe('#16a34a')
            expect(warn).toHaveBeenNthCalledWith(
                1,
                'Federated class "host-conflict" from "remote-a" was dropped because it is already registered by "host". Prefix remote class names to avoid conflicts.',
            )
            expect(warn).toHaveBeenNthCalledWith(
                2,
                'Federated CSS variable "--shared-color" from "remote-a" was dropped because it is already registered by "host". Prefix remote CSS variables to avoid conflicts.',
            )

            disposers.push(UniwindStore.merge('remote-a', registration, ['light', 'dark']))
            expect(warn).toHaveBeenCalledTimes(2)
        } finally {
            warn.mockRestore()
        }
    })

    test('replaces only the registration with the same owner ID', () => {
        const staleDispose = UniwindStore.merge(
            'remote-a',
            createRegistration({ 'rma:only': '#facc15' }),
            ['light', 'dark'],
        )
        const currentDispose = UniwindStore.merge(
            'remote-a',
            createRegistration({ 'rma:only': '#2563eb' }),
            ['light', 'dark'],
        )
        disposers.push(staleDispose, currentDispose)

        staleDispose()

        expect(getBackgroundColor('host-only')).toBe('#16a34a')
        expect(getBackgroundColor('rma:only')).toBe('#2563eb')
    })

    test('disposes one remote without changing the host', () => {
        const dispose = UniwindStore.merge(
            'remote-a',
            createRegistration({ 'rma:only': '#facc15' }),
            ['light', 'dark'],
        )
        disposers.push(dispose)

        dispose()

        expect(getBackgroundColor('host-only')).toBe('#16a34a')
        expect(getBackgroundColor('rma:only')).toBeUndefined()
    })

    test('preserves runtime variable overrides across remote changes', () => {
        UniwindStore.updateCSSVariables('light', {
            '--shared-color': () => '#ea580c',
        })
        const dispose = UniwindStore.merge(
            'remote-a',
            createRegistration({ 'rma:only': '#facc15' }),
            ['light', 'dark'],
        )
        disposers.push(dispose)

        expect(getBackgroundColor('host-variable')).toBe('#ea580c')

        dispose()

        expect(getBackgroundColor('host-variable')).toBe('#ea580c')
    })

    test('updates public CSS variable APIs when remote registrations change', () => {
        const variableName = '--rma-shared-color'
        const { result } = (() => {
            const warn = jest.spyOn(Logger, 'warn').mockImplementation()

            try {
                const hook = renderHook(() => useCSSVariable(variableName))

                expect(warn).toHaveBeenCalledWith(expect.stringContaining(`couldn't find your variable ${variableName}`))

                return hook
            } finally {
                warn.mockRestore()
            }
        })()
        let staleDispose = () => {}

        expect(Uniwind.getCSSVariable(variableName)).toBeUndefined()
        expect(result.current).toBeUndefined()

        act(() => {
            staleDispose = UniwindStore.merge(
                'remote-a',
                createRegistration({}, { [variableName]: '#facc15' }),
                ['light', 'dark'],
            )
        })
        disposers.push(staleDispose)

        expect(Uniwind.getCSSVariable('--shared-color')).toBe('#16a34a')
        expect(Uniwind.getCSSVariable(variableName)).toBe('#facc15')
        expect(result.current).toBe('#facc15')

        let currentDispose = () => {}

        act(() => {
            currentDispose = UniwindStore.merge(
                'remote-a',
                createRegistration({}, { [variableName]: '#2563eb' }),
                ['light', 'dark'],
            )
        })
        disposers.push(currentDispose)

        expect(Uniwind.getCSSVariable(variableName)).toBe('#2563eb')
        expect(result.current).toBe('#2563eb')

        act(() => staleDispose())

        expect(Uniwind.getCSSVariable(variableName)).toBe('#2563eb')
        expect(result.current).toBe('#2563eb')

        act(() => currentDispose())

        expect(Uniwind.getCSSVariable('--shared-color')).toBe('#16a34a')
        expect(Uniwind.getCSSVariable(variableName)).toBeUndefined()
        expect(result.current).toBeUndefined()
    })

    test('ignores invalid runtime CSS variable names in production', () => {
        const previousDev = (globalThis as typeof globalThis & { __DEV__: boolean }).__DEV__

        try {
            ;(globalThis as typeof globalThis & { __DEV__: boolean }).__DEV__ = false
            Uniwind.updateCSSVariables('light', { 'invalid-name': '#facc15' })

            expect(Object.hasOwn(UniwindStore.vars.light, 'invalid-name')).toBe(false)
        } finally {
            ;(globalThis as typeof globalThis & { __DEV__: boolean }).__DEV__ = previousDev
        }
    })

    test('notifies static and missing class subscribers when registrations change', () => {
        const listener = jest.fn()
        const variableListener = jest.fn()
        const staticStyle = UniwindStore.getStyles('host-only', undefined, undefined, context)
        const missingStyle = UniwindStore.getStyles('rma:only', undefined, undefined, context)
        const disposeStaticListener = UniwindListener.subscribe(listener, staticStyle.dependencies)
        const disposeMissingListener = UniwindListener.subscribe(listener, missingStyle.dependencies)
        const disposeVariableListener = UniwindListener.subscribe(variableListener, [StyleDependency.Variables])
        disposers.push(disposeStaticListener, disposeMissingListener, disposeVariableListener)

        expect(staticStyle.dependencies).toContain(StyleDependency.Stylesheet)
        expect(missingStyle.dependencies).toContain(StyleDependency.Stylesheet)

        const disposeRemote = UniwindStore.merge(
            'remote-a',
            createRegistration({ 'rma:only': '#facc15' }),
            ['light', 'dark'],
        )
        disposers.push(disposeRemote)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(variableListener).toHaveBeenCalledTimes(1)

        disposeRemote()

        expect(listener).toHaveBeenCalledTimes(4)
        expect(variableListener).toHaveBeenCalledTimes(2)
    })
})
