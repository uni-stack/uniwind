// @ts-nocheck

import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: false, slowMo: 250 })
const page = await browser.newPage({ viewport: { height: 1000, width: 1280 } })
const browserErrors = []

page.on('pageerror', error => browserErrors.push(error.message))
page.on('console', message => {
    if (message.type() === 'error') {
        browserErrors.push(message.text())
    }
})

const signalIds = [
    'host-only',
    'host-conflict',
    'host-variable',
    'remote-a-host-shared',
    'remote-a-only',
    'remote-a-conflict',
    'remote-a-variable',
    'remote-b-host-shared',
    'remote-b-only',
    'remote-b-conflict',
    'remote-b-variable',
]

const readColors = async () => {
    const colors = {}

    for (const id of signalIds) {
        const element = page.getByTestId(id)

        if (await element.count()) {
            colors[id] = await element.evaluate(node => getComputedStyle(node).backgroundColor)
        }
    }

    return colors
}

const readObservedValues = async () => {
    const values = {}

    for (const id of signalIds) {
        const element = page.getByTestId(`${id}-observed`)

        if (await element.count()) {
            values[id] = (await element.textContent())?.replace('Observed now: ', '')
        }
    }

    return values
}

const assertValues = (actual, expected, label) => {
    for (const [id, value] of Object.entries(expected)) {
        if (actual[id] !== value) {
            throw new Error(`${label} ${id}: expected ${value}, received ${actual[id]}`)
        }
    }
}

const waitForObservedValues = async expected => {
    const deadline = Date.now() + 10_000
    let values = {}

    while (Date.now() < deadline) {
        values = await readObservedValues()

        if (Object.entries(expected).every(([id, value]) => values[id] === value)) {
            return values
        }

        await page.waitForTimeout(100)
    }

    assertValues(values, expected, 'observed label')
}

const expectedRgb = {
    'host-only': 'rgb(22, 163, 74)',
    'host-conflict': 'rgb(22, 163, 74)',
    'host-variable': 'rgb(22, 163, 74)',
    'remote-a-host-shared': 'rgb(22, 163, 74)',
    'remote-a-only': 'rgb(250, 204, 21)',
    'remote-a-conflict': 'rgb(250, 204, 21)',
    'remote-a-variable': 'rgb(250, 204, 21)',
    'remote-b-host-shared': 'rgb(22, 163, 74)',
    'remote-b-only': 'rgb(37, 99, 235)',
    'remote-b-conflict': 'rgb(37, 99, 235)',
    'remote-b-variable': 'rgb(37, 99, 235)',
}

const expectedHex = {
    'host-only': '#16a34a',
    'host-conflict': '#16a34a',
    'host-variable': '#16a34a',
    'remote-a-host-shared': '#16a34a',
    'remote-a-only': '#facc15',
    'remote-a-conflict': '#facc15',
    'remote-a-variable': '#facc15',
    'remote-b-host-shared': '#16a34a',
    'remote-b-only': '#2563eb',
    'remote-b-conflict': '#2563eb',
    'remote-b-variable': '#2563eb',
}

const assertVisibleSignals = async () => {
    const colors = await readColors()
    const visibleIds = signalIds.filter(id => id in colors)
    const visibleRgb = Object.fromEntries(visibleIds.map(id => [id, expectedRgb[id]]))
    const visibleHex = Object.fromEntries(visibleIds.map(id => [id, expectedHex[id]]))

    assertValues(colors, visibleRgb, 'computed color')
    await waitForObservedValues(visibleHex)
}

const runOrder = async (first, second) => {
    await page.getByRole('button', { name: `Load Remote ${first}` }).click()
    await page.getByText(`Load order: Host -> ${first}`, { exact: true }).waitFor()
    await assertVisibleSignals()

    await page.getByRole('button', { name: `Load Remote ${second}` }).click()
    await page.getByText(`Load order: Host -> ${first} -> ${second}`, { exact: true }).waitFor()
    await assertVisibleSignals()
}

try {
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
    await assertVisibleSignals()
    await runOrder('A', 'B')

    await page.getByRole('button', { name: 'Reload runtime' }).click()
    await page.getByText('Load order: host only', { exact: true }).waitFor()
    await assertVisibleSignals()
    await runOrder('B', 'A')

    if (browserErrors.length) {
        throw new Error(`Browser errors:\n${browserErrors.join('\n')}`)
    }

    console.log('PASS: host-shared and prefixed remote classes and variables remain stable in both load orders')
} finally {
    await browser.close()
}
