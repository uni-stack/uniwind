import { transformSync } from '@babel/core'
import { componentTransform } from '../../../src/bundler/adapters/metro/component-transform'
import {
    NATIVE_COMPONENT_NAMES,
    type NativeComponentName,
    RAW_COMPONENTS_MODULE,
} from '../../../src/bundler/adapters/metro/constants'
import * as rawComponents from '../../../src/bundler/adapters/metro/raw-components'
import { shouldTransformClasslessComponents } from '../../../src/bundler/adapters/metro/transformer'

const CLASS_PROPS_BY_COMPONENT = {
    ActivityIndicator: ['className', 'colorClassName'],
    Button: ['colorClassName'],
    FlatList: [
        'className',
        'columnWrapperClassName',
        'contentContainerClassName',
        'ListFooterComponentClassName',
        'ListHeaderComponentClassName',
        'endFillColorClassName',
    ],
    Image: ['className', 'tintColorClassName'],
    ImageBackground: ['className', 'imageClassName', 'tintColorClassName'],
    InputAccessoryView: ['className', 'backgroundColorClassName'],
    KeyboardAvoidingView: ['className', 'contentContainerClassName'],
    Modal: ['className', 'backdropColorClassName'],
    Pressable: ['className'],
    RefreshControl: [
        'className',
        'colorsClassName',
        'tintColorClassName',
        'titleColorClassName',
        'progressBackgroundColorClassName',
    ],
    SafeAreaView: ['className'],
    ScrollView: ['className', 'contentContainerClassName', 'endFillColorClassName'],
    SectionList: [
        'className',
        'contentContainerClassName',
        'ListFooterComponentClassName',
        'ListHeaderComponentClassName',
        'endFillColorClassName',
    ],
    Switch: [
        'className',
        'trackColorOnClassName',
        'trackColorOffClassName',
        'thumbColorClassName',
        'ios_backgroundColorClassName',
    ],
    Text: ['className', 'selectionColorClassName'],
    TextInput: [
        'className',
        'cursorColorClassName',
        'selectionColorClassName',
        'placeholderTextColorClassName',
        'selectionHandleColorClassName',
        'underlineColorAndroidClassName',
    ],
    TouchableHighlight: ['className', 'underlayColorClassName'],
    TouchableNativeFeedback: ['className'],
    TouchableOpacity: ['className'],
    TouchableWithoutFeedback: ['className'],
    View: ['className'],
    VirtualizedList: [
        'className',
        'contentContainerClassName',
        'ListFooterComponentClassName',
        'ListHeaderComponentClassName',
        'endFillColorClassName',
    ],
} as const satisfies Record<NativeComponentName, ReadonlyArray<string>>

const transform = (source: string) => {
    const result = transformSync(source, {
        babelrc: false,
        configFile: false,
        filename: 'Component.tsx',
        parserOpts: {
            plugins: ['jsx', 'typescript'],
        },
        plugins: [componentTransform],
    })

    if (!result?.code) {
        throw new Error('Expected Babel to produce code')
    }

    return result.code
}

describe.each(NATIVE_COMPONENT_NAMES)('%s compile-time dispatch', componentName => {
    test('is exported by the private raw-component module', () => {
        expect(rawComponents[componentName]).toBeDefined()
    })

    test('rewrites statically classless JSX to the raw component', () => {
        const code = transform(`
            import { ${componentName} } from 'react-native'

            export const Component = () => <${componentName} testID="component" />
        `)

        expect(code).toContain(`from "${RAW_COMPONENTS_MODULE}"`)
        expect(code).toContain(`${componentName} as _Raw${componentName}`)
        expect(code).toContain(`<_Raw${componentName} testID="component" />`)
    })

    test.each(CLASS_PROPS_BY_COMPONENT[componentName])(
        'keeps %s on the Uniwind wrapper path',
        classProp => {
            const code = transform(`
                import { ${componentName} } from 'react-native'

                export const Component = () => <${componentName} ${classProp}="test" />
            `)

            expect(code).not.toContain(RAW_COMPONENTS_MODULE)
            expect(code).toContain(`<${componentName} ${classProp}="test" />`)
        },
    )

    test('keeps prop spreads on the Uniwind wrapper path', () => {
        const code = transform(`
            import { ${componentName} } from 'react-native'

            export const Component = props => <${componentName} {...props} />
        `)

        expect(code).not.toContain(RAW_COMPONENTS_MODULE)
        expect(code).toContain(`<${componentName} {...props} />`)
    })
})

test('uses raw components only for provably classless JSX', () => {
    const code = transform(`
        import { Text, View } from 'react-native'

        export const Component = () => (
            <View style={{ flex: 1 }}>
                <Text className="font-bold">Styled</Text>
                <Text style={{ color: 'black' }}>Raw</Text>
            </View>
        )
    `)

    expect(code).toContain(`from "${RAW_COMPONENTS_MODULE}"`)
    expect(code).toMatch(/import \{ View as _RawView, Text as _RawText \}/)
    expect(code).toContain('<_RawView')
    expect(code).toContain('<Text className="font-bold">')
    expect(code).toContain('<_RawText style=')
})

test('keeps elements with spreads on the wrapped component path', () => {
    const code = transform(`
        import { View } from 'react-native'

        export const Component = (props) => (
            <>
                <View {...props} />
                <View style={props.style} />
            </>
        )
    `)

    expect(code).toContain('<View {...props} />')
    expect(code).toContain('<_RawView style={props.style} />')
})

test('supports namespace imports and constant aliases', () => {
    const code = transform(`
        import * as RN from 'react-native'
        import { View } from 'react-native'

        const Alias = View

        export const Component = () => (
            <>
                <RN.Text />
                <Alias />
            </>
        )
    `)

    expect(code).toMatch(/import \{ Text as _RawText, View as _RawView \}/)
    expect(code).toContain('<_RawText />')
    expect(code).toContain('<_RawView />')
})

test('supports CommonJS destructuring', () => {
    const code = transform(`
        const { Text: Label, View } = require('react-native')

        export const Component = () => (
            <View>
                <Label />
            </View>
        )
    `)

    expect(code).toMatch(/import \{ View as _RawView, Text as _RawText \}/)
    expect(code).toContain('<_RawView>')
    expect(code).toContain('<_RawText />')
})

test('optimizes only createElement calls with static classless props', () => {
    const code = transform(`
        import React, { createElement } from 'react'
        import { View } from 'react-native'

        export const raw = React.createElement(View, { style: { flex: 1 } })
        export const rawNamed = createElement(View, null)
        export const styled = React.createElement(View, { className: 'flex-1' })
        export const dynamic = React.createElement(View, props)
    `)

    expect(code).toContain('React.createElement(_RawView, {')
    expect(code).toContain('createElement(_RawView, null)')
    expect(code).toContain('React.createElement(View, {\n  className: \'flex-1\'')
    expect(code).toContain('React.createElement(View, props)')
})

test('does not rewrite unrelated components', () => {
    const code = transform(`
        import { View as CustomView } from './components'

        export const Component = () => <CustomView style={{ flex: 1 }} />
    `)

    expect(code).not.toContain(RAW_COMPONENTS_MODULE)
    expect(code).toContain('<CustomView style=')
})

test('does not rewrite unsupported React Native exports', () => {
    const code = transform(`
        import { StatusBar } from 'react-native'

        export const Component = () => <StatusBar />
    `)

    expect(code).not.toContain(RAW_COMPONENTS_MODULE)
    expect(code).toContain('<StatusBar />')
})

test('requires the Metro experimental option', () => {
    const source = Buffer.from(`import { View } from 'react-native'`)
    const nativeOptions = {
        platform: 'android',
        type: 'module' as const,
    }

    expect(shouldTransformClasslessComponents({}, source, nativeOptions)).toBe(false)
    expect(shouldTransformClasslessComponents(
        {
            experimental: {
                optimizeClasslessComponents: false,
            },
        },
        source,
        nativeOptions,
    )).toBe(false)
    expect(shouldTransformClasslessComponents(
        {
            experimental: {
                optimizeClasslessComponents: true,
            },
        },
        source,
        nativeOptions,
    )).toBe(true)
    expect(shouldTransformClasslessComponents(
        {
            experimental: {
                optimizeClasslessComponents: true,
            },
        },
        source,
        {
            ...nativeOptions,
            platform: 'web',
        },
    )).toBe(false)
})
