import { StyleDependency } from '../../common/consts'
import { UniwindListener } from '../listener'

const isHexDigit = (value: string) => /^[\da-f]$/i.test(value)

const unescapeCSSIdentifier = (value: string) => {
    let result = ''
    let index = 0

    while (index < value.length) {
        if (value[index] !== '\\') {
            result += value[index]
            index += 1
            continue
        }

        index += 1

        if (index >= value.length) {
            break
        }

        let hex = ''

        while (hex.length < 6 && index < value.length && isHexDigit(value[index]!)) {
            hex += value[index]
            index += 1
        }

        if (hex) {
            const codePoint = Number.parseInt(hex, 16)
            result += codePoint === 0 || codePoint > 0x10FFFF || (codePoint >= 0xD800 && codePoint <= 0xDFFF)
                ? '\uFFFD'
                : String.fromCodePoint(codePoint)

            if (index < value.length && /\s/.test(value[index]!)) {
                index += 1
            }

            continue
        }

        result += value[index]
        index += 1
    }

    return result
}

const parseLeadingClassName = (selectorText: string) => {
    if (!selectorText.startsWith('.')) {
        return null
    }

    let index = 1

    while (index < selectorText.length) {
        const character = selectorText[index]!

        if (character === '\\') {
            index += 1

            let hexLength = 0

            while (hexLength < 6 && index < selectorText.length && isHexDigit(selectorText[index]!)) {
                hexLength += 1
                index += 1
            }

            if (hexLength > 0 && index < selectorText.length && /\s/.test(selectorText[index]!)) {
                index += 1
            } else if (hexLength === 0 && index < selectorText.length) {
                index += 1
            }

            continue
        }

        if (/\s/.test(character) || '.#:[]>+~,'.includes(character)) {
            break
        }

        index += 1
    }

    const className = selectorText.slice(1, index)

    return className ? unescapeCSSIdentifier(className) : null
}

class CSSListenerBuilder {
    activeRules = new Set<CSSStyleRule>()
    private classNameListeners = new Map<string, Set<VoidFunction>>()
    private mediaQueryRuleListeners = new Map<CSSStyleRule, {
        listener: VoidFunction
        mediaQueryList: MediaQueryList
        query: string
    }>()
    private registeredRulesMediaQueries = new Map<string, MediaQueryList>()
    private processedStyleSheets = new Set<CSSStyleSheet>()
    private styleSheetMediaListeners = new Map<CSSStyleSheet, {
        listener: VoidFunction
        mediaQueryList: MediaQueryList
        query: string
    }>()
    private pendingInitialization: number | undefined = undefined
    private pendingStyleSheetsChanged = false

    constructor() {
        if (typeof document === 'undefined') {
            return
        }

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes') {
                    const el = mutation.target as HTMLLinkElement | HTMLStyleElement

                    if (!('sheet' in el)) {
                        continue
                    }

                    const sheet = el.sheet

                    if (sheet) {
                        const styleSheetsChanged = this.removeStyleSheetRules(sheet)
                        this.pendingStyleSheetsChanged ||= styleSheetsChanged
                    }

                    this.scheduleInitialization()
                }

                if (mutation.type === 'childList') {
                    if (mutation.target instanceof HTMLStyleElement && mutation.target.sheet) {
                        const styleSheetsChanged = this.removeStyleSheetRules(mutation.target.sheet)
                        this.pendingStyleSheetsChanged ||= styleSheetsChanged
                    }

                    this.scheduleInitialization()
                }
            }
        })

        this.initialize()
        observer.observe(document.head, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'media', 'title', 'href', 'rel'],
        })
    }

    subscribeToClassName(classNames: string, listener: VoidFunction) {
        const disposables = [] as Array<VoidFunction>

        classNames.split(' ').filter(Boolean).forEach(className => {
            const listeners = this.classNameListeners.get(className) ?? new Set()

            listeners.add(listener)
            this.classNameListeners.set(className, listeners)
            disposables.push(() => {
                listeners.delete(listener)

                if (listeners.size === 0) {
                    this.classNameListeners.delete(className)
                }
            })
        })

        const disposeThemeListener = UniwindListener.subscribe(listener, [StyleDependency.Theme, StyleDependency.Variables])

        return () => {
            disposables.forEach(disposable => disposable())
            disposeThemeListener()
        }
    }

    private scheduleInitialization(styleSheetsChanged = false) {
        this.pendingStyleSheetsChanged ||= styleSheetsChanged
        this.cancelPendingInitialization()

        if (typeof requestIdleCallback !== 'undefined') {
            this.pendingInitialization = requestIdleCallback(() => {
                this.initialize()
            }, { timeout: 50 })

            return
        }

        this.pendingInitialization = setTimeout(() => {
            this.initialize()
        }, 50) as unknown as number
    }

    private cancelPendingInitialization() {
        if (this.pendingInitialization !== undefined) {
            if (typeof cancelIdleCallback !== 'undefined') {
                cancelIdleCallback(this.pendingInitialization)
            } else {
                clearTimeout(this.pendingInitialization)
            }

            this.pendingInitialization = undefined
        }
    }

    private getStyleSheetElement(sheet: CSSStyleSheet) {
        return Array.from(document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel~="stylesheet"], style'))
            .find(element => element.sheet === sheet)
    }

    private getStyleSheetMediaQuery(sheet: CSSStyleSheet) {
        const mediaText = sheet.media?.mediaText
            || this.getStyleSheetElement(sheet)?.media
            || ''
        const query = mediaText.trim()

        return query && query !== 'all' ? query : null
    }

    private isStyleSheetDisabled(sheet: CSSStyleSheet) {
        const element = this.getStyleSheetElement(sheet)
        const elementDisabled = element
            ? element.hasAttribute('disabled') || (element instanceof HTMLLinkElement && element.disabled)
            : false

        return sheet.disabled || elementDisabled
    }

    private isStyleSheetActive(sheet: CSSStyleSheet, connectedSheets = new Set(Array.from(document.styleSheets))) {
        if (!connectedSheets.has(sheet) || this.isStyleSheetDisabled(sheet)) {
            return false
        }

        const query = this.getStyleSheetMediaQuery(sheet)

        if (!query) {
            return true
        }

        const registration = this.styleSheetMediaListeners.get(sheet)

        return registration?.query === query && registration.mediaQueryList.matches
    }

    private syncStyleSheetMediaListener(sheet: CSSStyleSheet) {
        const query = this.getStyleSheetMediaQuery(sheet)
        const existingRegistration = this.styleSheetMediaListeners.get(sheet)

        if (existingRegistration?.query === query) {
            return
        }

        if (existingRegistration) {
            existingRegistration.mediaQueryList.removeEventListener('change', existingRegistration.listener)
            this.styleSheetMediaListeners.delete(sheet)
        }

        if (!query) {
            return
        }

        const mediaQueryList = window.matchMedia(query)
        const listener = () => {
            this.scheduleInitialization(this.removeStyleSheetRules(sheet))
        }

        mediaQueryList.addEventListener('change', listener)
        this.styleSheetMediaListeners.set(sheet, {
            listener,
            mediaQueryList,
            query,
        })
    }

    private removeStyleSheetRules(sheet: CSSStyleSheet) {
        let styleSheetsChanged = false

        if (this.processedStyleSheets.delete(sheet)) {
            styleSheetsChanged = true
        }

        for (const rule of this.activeRules) {
            if (rule.parentStyleSheet === sheet) {
                this.activeRules.delete(rule)
                styleSheetsChanged = true
            }
        }

        const staleQueries = new Set<string>()

        for (const [rule, registration] of this.mediaQueryRuleListeners) {
            if (rule.parentStyleSheet === sheet) {
                registration.mediaQueryList.removeEventListener('change', registration.listener)
                this.mediaQueryRuleListeners.delete(rule)
                staleQueries.add(registration.query)
                styleSheetsChanged = true
            }
        }

        for (const query of staleQueries) {
            const queryIsRegistered = Array.from(this.mediaQueryRuleListeners.values())
                .some(registration => registration.query === query)

            if (!queryIsRegistered) {
                this.registeredRulesMediaQueries.delete(query)
            }
        }

        return styleSheetsChanged
    }

    private pruneStaleRules(connectedSheets: Set<CSSStyleSheet>) {
        let styleSheetsChanged = false

        for (const sheet of this.processedStyleSheets) {
            if (!this.isStyleSheetActive(sheet, connectedSheets)) {
                const sheetChanged = this.removeStyleSheetRules(sheet)
                styleSheetsChanged ||= sheetChanged
            }
        }

        const activeSheets = new Set(this.processedStyleSheets)

        for (const rule of this.activeRules) {
            if (!rule.parentStyleSheet || !activeSheets.has(rule.parentStyleSheet)) {
                this.activeRules.delete(rule)
                styleSheetsChanged = true
            }
        }

        const staleQueries = new Set<string>()

        for (const [rule, registration] of this.mediaQueryRuleListeners) {
            if (!rule.parentStyleSheet || !activeSheets.has(rule.parentStyleSheet)) {
                registration.mediaQueryList.removeEventListener('change', registration.listener)
                this.mediaQueryRuleListeners.delete(rule)
                this.activeRules.delete(rule)
                staleQueries.add(registration.query)
                styleSheetsChanged = true
            }
        }

        for (const query of staleQueries) {
            const queryIsRegistered = Array.from(this.mediaQueryRuleListeners.values())
                .some(registration => registration.query === query)

            if (!queryIsRegistered) {
                this.registeredRulesMediaQueries.delete(query)
            }
        }

        for (const [sheet, registration] of this.styleSheetMediaListeners) {
            if (!connectedSheets.has(sheet)) {
                registration.mediaQueryList.removeEventListener('change', registration.listener)
                this.styleSheetMediaListeners.delete(sheet)
            }
        }

        return styleSheetsChanged
    }

    private initialize() {
        this.pendingInitialization = undefined
        const connectedSheets = new Set(Array.from(document.styleSheets))

        connectedSheets.forEach(sheet => this.syncStyleSheetMediaListener(sheet))

        let styleSheetsChanged = this.pendingStyleSheetsChanged
        this.pendingStyleSheetsChanged = false
        const staleRulesChanged = this.pruneStaleRules(connectedSheets)
        styleSheetsChanged ||= staleRulesChanged

        for (const sheet of connectedSheets) {
            if (!this.isStyleSheetActive(sheet, connectedSheets)) {
                continue
            }

            // Skip already processed stylesheets
            if (this.processedStyleSheets.has(sheet)) {
                continue
            }

            let rules: CSSRuleList

            try {
                // May throw for cross-origin stylesheets
                rules = sheet.cssRules
            } catch {
                continue
            }

            // oxlint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!rules) {
                continue
            }

            // Mark as processed after successful cssRules access
            this.processedStyleSheets.add(sheet)
            styleSheetsChanged = true

            this.addMediaQueriesDeep(rules)
        }

        if (styleSheetsChanged) {
            UniwindListener.notify([StyleDependency.Variables])
        }
    }

    private isStyleRule(rule: CSSRule): rule is CSSStyleRule {
        return rule.constructor.name === 'CSSStyleRule'
    }

    private isMediaRule(rule: CSSRule): rule is CSSMediaRule {
        return rule.constructor.name === 'CSSMediaRule'
    }

    private isSupportsRule(rule: CSSRule): rule is CSSSupportsRule {
        return rule.constructor.name === 'CSSSupportsRule'
    }

    private hasNestedRules(rule: CSSRule): rule is CSSRule & { cssRules: CSSRuleList } {
        return 'cssRules' in rule
    }

    private collectParentMediaQueries(rule: CSSRule, acc = [] as Array<CSSMediaRule>): Array<CSSMediaRule> {
        const { parentRule } = rule

        if (!parentRule) {
            return []
        }

        if (this.isMediaRule(parentRule)) {
            acc.push(parentRule)
        }

        const result = this.collectParentMediaQueries(parentRule, acc)

        acc.push(...result)

        return Array.from(new Set(acc))
    }

    private addMediaQueriesDeep(rules: CSSRuleList) {
        for (const rule of Array.from(rules)) {
            if (this.isStyleRule(rule)) {
                const mediaQueries = this.collectParentMediaQueries(rule)

                this.activeRules.add(rule)

                if (mediaQueries.length > 0) {
                    this.addMediaQuery(mediaQueries, rule)
                }

                continue
            }

            if (this.isSupportsRule(rule)) {
                if (!CSS.supports(rule.conditionText)) {
                    continue
                }

                this.addMediaQueriesDeep(rule.cssRules)

                continue
            }

            if (this.hasNestedRules(rule)) {
                this.addMediaQueriesDeep(rule.cssRules)

                continue
            }
        }
    }

    private addMediaQuery(mediaQueries: Array<CSSMediaRule>, rule: CSSStyleRule) {
        const rules = mediaQueries.map(mediaQuery => mediaQuery.conditionText).sort().join(' and ')
        const existingRegistration = this.mediaQueryRuleListeners.get(rule)

        if (existingRegistration) {
            this.toggleRule(existingRegistration.mediaQueryList, rule)
            return
        }

        const parsedClassName = parseLeadingClassName(rule.selectorText)
        const mediaQueryList = this.registeredRulesMediaQueries.get(rules) ?? window.matchMedia(rules)
        const listener = () => {
            this.toggleRule(mediaQueryList, rule)

            if (parsedClassName) {
                this.notifyClassName(parsedClassName)
            }
        }

        this.toggleRule(mediaQueryList, rule)
        this.registeredRulesMediaQueries.set(rules, mediaQueryList)
        this.mediaQueryRuleListeners.set(rule, {
            listener,
            mediaQueryList,
            query: rules,
        })
        mediaQueryList.addEventListener('change', listener)
    }

    private notifyClassName(className: string) {
        this.classNameListeners.get(className)?.forEach(listener => listener())
    }

    private isRuleLive(rule: CSSStyleRule) {
        const sheet = rule.parentStyleSheet
        return sheet !== null && this.isStyleSheetActive(sheet)
    }

    private toggleRule(mqList: MediaQueryList, rule: CSSStyleRule) {
        if (mqList.matches && this.isRuleLive(rule)) {
            this.activeRules.add(rule)
        } else {
            this.activeRules.delete(rule)
        }
    }
}

export const CSSListener = new CSSListenerBuilder()
