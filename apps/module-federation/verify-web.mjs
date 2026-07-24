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
    'remote-a-only',
    'remote-a-conflict',
    'remote-a-variable',
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

const ownerColors = {
    'host-only': 'rgb(22, 163, 74)',
    'remote-a-only': 'rgb(250, 204, 21)',
    'remote-b-only': 'rgb(37, 99, 235)',
}

const sharedColors = expected =>
    Object.fromEntries(
        ['host', 'remote-a', 'remote-b'].flatMap(owner => [
            [`${owner}-conflict`, expected],
            [`${owner}-variable`, expected],
        ]),
    )

const runOrder = async (first, second, winner) => {
    await page.getByRole('button', { name: `Load Remote ${first}` }).click()
    await page.getByText(`Load order: Host -> ${first}`, { exact: true }).waitFor()
    await page.getByRole('button', { name: `Load Remote ${second}` }).click()
    await page.getByText(`Load order: Host -> ${first} -> ${second}`, { exact: true }).waitFor()

    const expectedHex = winner === 'A' ? '#facc15' : '#2563eb'
    const expectedRgb = winner === 'A' ? 'rgb(250, 204, 21)' : 'rgb(37, 99, 235)'
    const expectedObserved = {
        'host-only': '#16a34a',
        'remote-a-only': '#facc15',
        'remote-b-only': '#2563eb',
        ...sharedColors(expectedHex),
    }

    assertValues(await readColors(), {
        ...ownerColors,
        ...sharedColors(expectedRgb),
    }, 'computed color')
    await waitForObservedValues(expectedObserved)
}

try {
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
    await runOrder('A', 'B', 'B')

    await page.getByRole('button', { name: 'Reload runtime' }).click()
    await page.getByText('Load order: host only', { exact: true }).waitFor()
    await runOrder('B', 'A', 'A')

    if (browserErrors.length) {
        throw new Error(`Browser errors:\n${browserErrors.join('\n')}`)
    }

    console.log('PASS: owner-only styles survive; shared classes and variables follow the last-loaded remote')
} finally {
    await browser.close()
}
