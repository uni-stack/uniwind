import { StyleDependency } from '../../common/consts'
import { UniwindListener } from '../listener'

class CSSListenerBuilder {
    activeRules = new Set<CSSStyleRule>()
    private classNameListeners = new Map<string, Set<VoidFunction>>()
    private registeredRulesMediaQueries = new Map<string, MediaQueryList>()
    private processedStyleSheets = new Set<CSSStyleSheet>()
    private pendingInitialization: number | undefined = undefined

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
                        this.processedStyleSheets.delete(sheet)
                    }

                    this.scheduleInitialization()
                }

                if (mutation.type === 'childList') {
                    this.scheduleInitialization()
                }
            }
        })

        this.initialize()
        observer.observe(document.head, {
            childList: true,
            subtree: false,
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

    private scheduleInitialization() {
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

    private pruneStaleRules() {
        const activeSheets = new Set(Array.from(document.styleSheets))
        let styleSheetsChanged = false

        for (const sheet of this.processedStyleSheets) {
            if (!activeSheets.has(sheet)) {
                this.processedStyleSheets.delete(sheet)
                styleSheetsChanged = true
            }
        }

        for (const rule of this.activeRules) {
            if (!rule.parentStyleSheet || !activeSheets.has(rule.parentStyleSheet)) {
                this.activeRules.delete(rule)
                styleSheetsChanged = true
            }
        }

        return styleSheetsChanged
    }

    private initialize() {
        this.pendingInitialization = undefined
        let styleSheetsChanged = this.pruneStaleRules()

        for (const sheet of Array.from(document.styleSheets)) {
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
        const className = rule.selectorText
        const rules = mediaQueries.map(mediaQuery => mediaQuery.conditionText).sort().join(' and ')
        const parsedClassName = className.replace('.', '').replace('\\', '')
        const cachedMediaQueryList = this.registeredRulesMediaQueries.get(rules)

        if (cachedMediaQueryList) {
            this.toggleRule(cachedMediaQueryList, rule)

            cachedMediaQueryList.addEventListener('change', () => {
                this.toggleRule(cachedMediaQueryList, rule)
                this.notifyClassName(parsedClassName)
            })

            return
        }

        const mediaQueryList = window.matchMedia(rules)

        this.toggleRule(mediaQueryList, rule)
        this.registeredRulesMediaQueries.set(rules, mediaQueryList)

        mediaQueryList.addEventListener('change', () => {
            this.toggleRule(mediaQueryList, rule)
            this.notifyClassName(parsedClassName)
        })
    }

    private notifyClassName(className: string) {
        this.classNameListeners.get(className)?.forEach(listener => listener())
    }

    private isRuleLive(rule: CSSStyleRule) {
        const sheet = rule.parentStyleSheet
        return sheet !== null && Array.from(document.styleSheets).includes(sheet)
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
