import { readFileSync } from 'node:fs'
import { generateCSSForThemes } from '../../../src/bundler/artifacts/css/themes'

// tests/test.css imports this package's uniwind.css, which npm publishes as it is on disk.
test('keeps the test themes out of the published uniwind.css', async () => {
    const testThemesCSS = await generateCSSForThemes(['light', 'dark'], './tests/test.css')

    expect(readFileSync('./uniwind.css', 'utf-8')).not.toContain(testThemesCSS)
})
