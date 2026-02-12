import '@testing-library/jest-dom'

// Mock CSS-related globals that JSDOM doesn't define
if (typeof CSSRuleList === 'undefined') {
    global.CSSRuleList = class CSSRuleList {} as any
}

if (typeof CSSRule === 'undefined') {
    global.CSSRule = class CSSRule {
        parentRule: CSSRule | null = null
    } as any
}

if (typeof CSSStyleRule === 'undefined') {
    global.CSSStyleRule = class CSSStyleRule extends global.CSSRule {} as any
}

if (typeof CSSMediaRule === 'undefined') {
    global.CSSMediaRule = class CSSMediaRule extends global.CSSRule {
        media: MediaQueryList | null = null
    } as any
}

// Mock Uniwind for web tests
// Since we're just testing that className props are passed through,
// we don't need full Uniwind initialization
beforeAll(() => {
    // Set up document class for theme support
    if (typeof document !== 'undefined') {
        document.documentElement.className = 'light'
    }
})
