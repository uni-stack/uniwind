const AXIS_REGEX = /^(['"]?)(.{4})\1\s+(\S+)$/

// RN requires quoted axis tags, serializer strips them
export const parseFontVariationSettings = (fontVariationSettings: string) =>
    fontVariationSettings
        .split(',')
        .map(axis => axis.trim().replace(AXIS_REGEX, `'$2' $3`))
        .join(', ')
