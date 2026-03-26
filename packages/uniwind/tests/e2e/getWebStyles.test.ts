import { expect, test } from '@playwright/test'
import { readFileSync } from 'fs'
import type { UniwindContextType } from '../../src/core/types'
import { BUNDLE_PATH, CSS_PATH } from './global-setup'
import './window.d.ts'
import { TW_BLUE_500, TW_RED_500 } from '../consts'

// Load the compiled artifacts produced by global-setup.ts
const compiledCSS = readFileSync(CSS_PATH, 'utf-8')
const bundle = readFileSync(BUNDLE_PATH, 'utf-8')

/**
 * Calls getWebStyles inside the browser context and returns the RN style object.
 */
async function getWebStyles(
    page: import('@playwright/test').Page,
    className: string,
    context: UniwindContextType = { scopedTheme: null },
) {
    return page.evaluate(
        ([cls, ctx]) => {
            return window.__uniwind.getWebStyles(cls, undefined, ctx)
        },
        [className, context],
    )
}

test.beforeEach(async ({ page }) => {
    await page.setContent(`
        <!DOCTYPE html>
        <html class="light">
        <head>
            <style>${compiledCSS}</style>
        </head>
        <body></body>
        </html>
    `)
    await page.addScriptTag({ content: bundle })
})

test.describe('getWebStyles — basic cases', () => {
    test('bg-red-500 → backgroundColor #fb2c36', async ({ page }) => {
        const styles = await getWebStyles(page, 'bg-red-500')
        expect(styles.backgroundColor).toBe(TW_RED_500)
    })

    test('bg-red-500 color-blue-500 → backgroundColor tw-red-500 & color tw-blue-500', async ({ page }) => {
        const styles = await getWebStyles(page, 'bg-red-500 text-blue-500')
        expect(styles.backgroundColor).toBe(TW_RED_500)
        expect(styles.color).toBe(TW_BLUE_500)
    })
})

test.describe('getWebStyles — scoped theme', () => {
    test('bg-background in dark theme → backgroundColor black', async ({ page }) => {
        const styles = await getWebStyles(page, 'bg-background', { scopedTheme: 'dark' })
        expect(styles.backgroundColor).toBe('#000000')
    })

    test('bg-background in light theme → backgroundColor white', async ({ page }) => {
        const styles = await getWebStyles(page, 'bg-background', { scopedTheme: 'light' })
        expect(styles.backgroundColor).toBe('#ffffff')
    })
})

test.describe('getWebStyles - html default styles', () => {
    test('bg-red-500 -> should only include backgroundColor', async ({ page }) => {
        const styles = await getWebStyles(page, 'bg-red-500')
        expect(styles).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('text-base -> fontSize 16px', async ({ page }) => {
        const styles = await getWebStyles(page, 'text-base')
        expect(styles.fontSize).toBe('16px')
        expect(styles.lineHeight).toBe('24px')
    })

    test('max-w-0:text-base -> empty object', async ({ page }) => {
        const styles = await getWebStyles(page, 'max-w-0:text-base')
        expect(styles).toEqual({})
    })
})
