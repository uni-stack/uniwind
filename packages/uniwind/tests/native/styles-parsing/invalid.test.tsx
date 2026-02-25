// Regression tests when tailwind compiler recognized something as a class that really wasn't one
const _ = `[aero-chip:label=Runway|value=09R]`

describe('Invalid classes', () => {
    test('Invalid class-like strings in source files do not break serialization', () => {
        // The presence of _ above ensures the Tailwind scanner picks up the invalid candidate.
        // The test passes as long as the setup (compileVirtual) does not throw.
        expect(true).toBe(true)
    })
})
