const fs = require('fs')
const path = require('path')
const { transform } = require('lightningcss')

// Keep the host CSS as the single source of truth for the shared candidate
// contract. Requiring this module from Metro evaluates the file once and
// returns the same list to the host and both remotes.
const hostCSSPath = path.resolve(__dirname, 'host/global.css')
const sharedClassNames = new Set()

// Lightning CSS reports Tailwind's @source directive as an unknown at-rule.
// Its AST lets us read inline() string arguments without matching CSS text
// with a regular expression.
transform({
    code: fs.readFileSync(hostCSSPath),
    filename: hostCSSPath,
    visitor: {
        Rule(rule) {
            if (rule.type !== 'unknown' || rule.value.name !== 'source') {
                return
            }

            const inlineSource = rule.value.prelude.find(
                part => part.type === 'function' && part.value.name === 'inline',
            )

            if (!inlineSource || inlineSource.type !== 'function') {
                return
            }

            // This demo uses literal, whitespace-separated candidates inside
            // @source inline("..."). Set insertion deduplicates candidates
            // when the host has multiple inline source declarations.
            inlineSource.value.arguments.forEach((argument) => {
                if (argument.type !== 'token' || argument.value.type !== 'string') {
                    return
                }

                argument.value.value.split(/\s+/).forEach((className) => {
                    if (className) {
                        sharedClassNames.add(className)
                    }
                })
            })
        },
    },
})

module.exports = {
    // Prevent a Metro config from mutating the contract after it is loaded.
    sharedClassNames: Object.freeze(Array.from(sharedClassNames)),
}
