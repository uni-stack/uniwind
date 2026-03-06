import { StyleDependency } from '../../types'
import { UniwindListener } from '../listener'

class CSSListenerBuilder {
    activeRules = new Set<CSSStyleRule>()
    private classNameMediaQueryListeners = new Map<string, MediaQueryList>()
    private listeners = new Map<MediaQueryList, Set<VoidFunction>>()
    private registeredRulesMediaQueries = new Map<string, MediaQueryList>()
    private processedStyleSheets = new WeakSet<CSSStyleSheet>()
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

        classNames.split(' ').forEach(className => {
            const mediaQuery = this.classNameMediaQueryListeners.get(className)

            if (!mediaQuery) {
                // eslint-disable-next-line no-empty-function
                return () => {}
            }

            const listeners = this.listeners.get(mediaQuery)

            listeners?.add(listener)
            disposables.push(() => listeners?.delete(listener))
        })

        const disposeThemeListener = UniwindListener.subscribe(listener, [StyleDependency.Theme])

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

        for (const rule of this.activeRules) {
            if (!rule.parentStyleSheet || !activeSheets.has(rule.parentStyleSheet)) {
                this.activeRules.delete(rule)
            }
        }
    }

    private initialize() {
        this.pendingInitialization = undefined
        this.pruneStaleRules()

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

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
            if (!rules) {
                continue
            }

            // Mark as processed after successful cssRules access
            this.processedStyleSheets.add(sheet)

            this.addMediaQueriesDeep(rules)
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

            if ('cssRules' in rule && rule.cssRules instanceof CSSRuleList) {
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
            this.classNameMediaQueryListeners.set(parsedClassName, cachedMediaQueryList)
            this.toggleRule(cachedMediaQueryList, rule)

            cachedMediaQueryList.addEventListener('change', () => {
                this.toggleRule(cachedMediaQueryList, rule)
            })

            return
        }

        const mediaQueryList = window.matchMedia(rules)

        this.toggleRule(mediaQueryList, rule)
        this.registeredRulesMediaQueries.set(rules, mediaQueryList)
        this.listeners.set(mediaQueryList, new Set())
        this.classNameMediaQueryListeners.set(parsedClassName, mediaQueryList)

        mediaQueryList.addEventListener('change', () => {
            this.listeners.get(mediaQueryList)!.forEach(listener => {
                listener()
            })
            this.toggleRule(mediaQueryList, rule)
        })
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
