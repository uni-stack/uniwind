export const parseTextShadowMutation = (styles: Record<string, any>) => {
    const tokens: Array<string> = styles.textShadow.replace(/,/g, '').split(' ')

    if (tokens.length === 0) {
        return
    }

    const color = tokens.find(token => token.startsWith('#')) ?? '#000000'
    const offsets = tokens.filter(token => token !== color)
    const [offsetX, offsetY, radius] = offsets

    if (offsetX !== undefined && offsetY !== undefined) {
        styles.textShadowOffset = {
            width: Number(offsetX),
            height: Number(offsetY),
        }
        delete styles.textShadow
    }

    if (radius !== undefined) {
        styles.textShadowRadius = Number(radius)
    }

    styles.textShadowColor = color
}
