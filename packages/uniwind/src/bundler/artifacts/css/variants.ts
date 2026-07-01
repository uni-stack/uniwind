const variants = ['ios', 'android', 'web', 'native', 'tv', 'android-tv', 'apple-tv']

const generateCSSForVariants = () => {
    let css = ''

    variants.forEach(variant => {
        css += `@custom-variant ${variant} (${variant === 'web' ? '@supports selector(div > div)' : `@media ${variant}`});\n`
    })

    return css
}

export const VARIANTS_CSS = generateCSSForVariants()
