const variants = ['ios', 'android', 'web', 'native', 'tv', 'android-tv', 'apple-tv']

export const generateCSSForVariants = () => {
    let css = ''

    variants.forEach(variant => {
        css += `@custom-variant ${variant} (${variant === 'web' ? 'html &' : `@media ${variant}`});\n`
    })

    return css
}
