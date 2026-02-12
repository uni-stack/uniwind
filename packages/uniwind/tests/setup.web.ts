import '@testing-library/jest-dom'

// Mock Uniwind for web tests
// Since we're just testing that className props are passed through,
// we don't need full Uniwind initialization
beforeAll(() => {
    // Set up document class for theme support
    if (typeof document !== 'undefined') {
        document.documentElement.className = 'light'
    }
})
