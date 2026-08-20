import type { NodePath, PluginObj } from '@babel/core'
import type * as t from '@babel/types'
import {
    NATIVE_COMPONENT_NAME_SET,
    type NativeComponentName,
    RAW_COMPONENTS_MODULE,
} from './constants'

const REACT_NATIVE_MODULE = 'react-native'
const REACT_MODULE = 'react'

const isNativeComponentName = (name: string): name is NativeComponentName => NATIVE_COMPONENT_NAME_SET.has(name)

const getImportSource = (path: NodePath) =>
    path.parentPath?.isImportDeclaration()
        ? path.parentPath.node.source.value
        : undefined

const getImportedName = (path: NodePath) => {
    if (!path.isImportSpecifier()) {
        return undefined
    }

    return path.node.imported.type === 'Identifier'
        ? path.node.imported.name
        : path.node.imported.value
}

const isRequireCall = (path: NodePath | null | undefined, moduleName: string) => {
    if (!path?.isCallExpression()) {
        return false
    }

    const callee = path.get('callee')
    const args = path.get('arguments')

    return callee.isIdentifier({ name: 'require' })
        && args.length === 1
        && args[0]?.isStringLiteral({ value: moduleName }) === true
}

const isModuleNamespace = (
    path: NodePath | null | undefined,
    moduleName: string,
    visited: Set<t.Node>,
): boolean => {
    if (!path) {
        return false
    }

    if (isRequireCall(path, moduleName)) {
        return true
    }

    if (!path.isIdentifier() && !path.isJSXIdentifier()) {
        return false
    }

    const binding = path.scope.getBinding(path.node.name)
    if (!binding?.constant || visited.has(binding.path.node)) {
        return false
    }
    visited.add(binding.path.node)

    if (
        (binding.path.isImportDefaultSpecifier() || binding.path.isImportNamespaceSpecifier())
        && getImportSource(binding.path) === moduleName
    ) {
        return true
    }

    if (!binding.path.isVariableDeclarator()) {
        return false
    }

    const init = binding.path.get('init')
    if (Array.isArray(init) || !init.node) {
        return false
    }

    return isModuleNamespace(init as NodePath, moduleName, visited)
}

const getObjectPropertyName = (path: NodePath) => {
    if (!path.isObjectProperty() || path.node.computed) {
        return undefined
    }

    const key = path.get('key')
    if (key.isIdentifier()) {
        return key.node.name
    }
    if (key.isStringLiteral()) {
        return key.node.value
    }

    return undefined
}

const resolveDestructuredComponent = (
    bindingPath: NodePath<t.VariableDeclarator>,
    localName: string,
    visited: Set<t.Node>,
) => {
    const id = bindingPath.get('id')
    const init = bindingPath.get('init')

    if (
        !id.isObjectPattern()
        || Array.isArray(init)
        || !init.node
        || !isModuleNamespace(init as NodePath, REACT_NATIVE_MODULE, visited)
    ) {
        return undefined
    }

    for (const property of id.get('properties')) {
        if (!property.isObjectProperty()) {
            continue
        }

        const value = property.get('value')
        if (!value.isIdentifier({ name: localName })) {
            continue
        }

        const componentName = getObjectPropertyName(property)
        if (componentName && isNativeComponentName(componentName)) {
            return componentName
        }
    }

    return undefined
}

const resolveComponentReference = (
    path: NodePath | null | undefined,
    visited = new Set<t.Node>(),
): NativeComponentName | undefined => {
    if (!path) {
        return undefined
    }

    if (
        path.isTSAsExpression()
        || path.isTSTypeAssertion()
        || path.isTypeCastExpression()
        || path.isParenthesizedExpression()
    ) {
        const expression = path.get('expression')

        return Array.isArray(expression)
            ? undefined
            : resolveComponentReference(expression, visited)
    }

    if (path.isJSXMemberExpression() || path.isMemberExpression()) {
        if (path.isMemberExpression() && path.node.computed) {
            return undefined
        }

        const property = path.get('property')
        const object = path.get('object')
        if (
            !Array.isArray(property)
            && (property.isIdentifier() || property.isJSXIdentifier())
            && isNativeComponentName(property.node.name)
            && !Array.isArray(object)
            && isModuleNamespace(object, REACT_NATIVE_MODULE, visited)
        ) {
            return property.node.name
        }

        return undefined
    }

    if (!path.isIdentifier() && !path.isJSXIdentifier()) {
        return undefined
    }

    const binding = path.scope.getBinding(path.node.name)
    if (!binding?.constant || visited.has(binding.path.node)) {
        return undefined
    }
    visited.add(binding.path.node)

    if (binding.path.isImportSpecifier() && getImportSource(binding.path) === REACT_NATIVE_MODULE) {
        const importedName = getImportedName(binding.path)

        return importedName && isNativeComponentName(importedName)
            ? importedName
            : undefined
    }

    if (!binding.path.isVariableDeclarator()) {
        return undefined
    }

    const destructuredComponent = resolveDestructuredComponent(
        binding.path,
        path.node.name,
        visited,
    )
    if (destructuredComponent) {
        return destructuredComponent
    }

    const init = binding.path.get('init')

    return Array.isArray(init) || !init.node
        ? undefined
        : resolveComponentReference(init as NodePath, visited)
}

const isUniwindProp = (name: string) => name === 'className' || name.endsWith('ClassName')

const isProvablyClasslessJSX = (path: NodePath<t.JSXOpeningElement>) => {
    for (const attribute of path.get('attributes')) {
        if (attribute.isJSXSpreadAttribute()) {
            return false
        }

        if (!attribute.isJSXAttribute()) {
            continue
        }

        const name = attribute.get('name')
        if (name.isJSXIdentifier() && isUniwindProp(name.node.name)) {
            return false
        }
    }

    return true
}

const isProvablyClasslessObject = (path: NodePath | undefined) => {
    if (!path || path.isNullLiteral()) {
        return true
    }

    if (!path.isObjectExpression()) {
        return false
    }

    for (const property of path.get('properties')) {
        if (property.isSpreadElement()) {
            return false
        }

        if (!property.isObjectMethod() && !property.isObjectProperty()) {
            return false
        }

        if (property.node.computed) {
            return false
        }

        const key = property.get('key')
        if (Array.isArray(key)) {
            return false
        }

        const name = key.isIdentifier()
            ? key.node.name
            : key.isStringLiteral()
            ? key.node.value
            : undefined

        if (name && isUniwindProp(name)) {
            return false
        }
    }

    return true
}

const isReactCreateElement = (path: NodePath<t.CallExpression>) => {
    const callee = path.get('callee')

    if (callee.isIdentifier()) {
        const binding = callee.scope.getBinding(callee.node.name)

        return binding?.constant === true
            && binding.path.isImportSpecifier()
            && getImportSource(binding.path) === REACT_MODULE
            && getImportedName(binding.path) === 'createElement'
    }

    if (!callee.isMemberExpression() || callee.node.computed) {
        return false
    }

    const property = callee.get('property')
    const object = callee.get('object')

    return !Array.isArray(property)
        && property.isIdentifier({ name: 'createElement' })
        && !Array.isArray(object)
        && (
            isModuleNamespace(object, REACT_MODULE, new Set())
            || (object.isIdentifier({ name: 'React' }) && object.scope.getBinding('React') === undefined)
        )
}

export const componentTransform = ({ types }: { types: typeof t }): PluginObj => ({
    name: 'uniwind-component-transform',
    visitor: {
        Program(programPath) {
            const rawIdentifiers = new Map<NativeComponentName, t.Identifier>()
            const getRawIdentifier = (componentName: NativeComponentName) => {
                const existing = rawIdentifiers.get(componentName)
                if (existing) {
                    return existing
                }

                const identifier = programPath.scope.generateUidIdentifier(`Raw${componentName}`)
                rawIdentifiers.set(componentName, identifier)

                return identifier
            }

            programPath.traverse({
                JSXElement(elementPath) {
                    const openingElement = elementPath.get('openingElement')
                    if (!isProvablyClasslessJSX(openingElement)) {
                        return
                    }

                    const name = openingElement.get('name')
                    const componentName = Array.isArray(name)
                        ? undefined
                        : resolveComponentReference(name)
                    if (!componentName) {
                        return
                    }

                    const rawName = types.jsxIdentifier(getRawIdentifier(componentName).name)
                    openingElement.node.name = rawName
                    if (elementPath.node.closingElement) {
                        elementPath.node.closingElement.name = types.jsxIdentifier(rawName.name)
                    }
                },
                CallExpression(callPath) {
                    if (!isReactCreateElement(callPath)) {
                        return
                    }

                    const args = callPath.get('arguments')
                    const component = args[0]
                    const props = args[1]
                    if (
                        !component
                        || component.isSpreadElement()
                        || (props?.isSpreadElement() === true)
                        || !isProvablyClasslessObject(props)
                    ) {
                        return
                    }

                    const componentName = resolveComponentReference(component)
                    if (!componentName) {
                        return
                    }

                    component.replaceWith(getRawIdentifier(componentName))
                },
            })

            if (rawIdentifiers.size === 0) {
                return
            }

            const specifiers = Array.from(rawIdentifiers, ([componentName, local]) => types.importSpecifier(local, types.identifier(componentName)))
            const declaration = types.importDeclaration(
                specifiers,
                types.stringLiteral(RAW_COMPONENTS_MODULE),
            )
            const imports = programPath.get('body').filter(path => path.isImportDeclaration())
            const lastImport = imports.at(-1)

            if (lastImport) {
                lastImport.insertAfter(declaration)
            } else {
                programPath.unshiftContainer('body', declaration)
            }
        },
    },
})
